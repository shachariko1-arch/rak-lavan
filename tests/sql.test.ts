import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Runs the real migration in an embedded Postgres with a minimal stand-in for Supabase's
 * auth schema, then checks Row Level Security and the guest-facing functions.
 */
const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";
let db: PGlite;

const as = async <T,>(role: "anon" | "authenticated", uid: string | null, sql: string): Promise<T[]> => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false); set role ${role};`);
  try {
    return (await db.query<T>(sql)).rows;
  } finally {
    await db.exec("reset role;");
  }
};

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
  `);
  await db.exec(readFileSync("supabase/migrations/20261116000000_init.sql", "utf8"));
  await db.exec(`grant usage on schema public to anon, authenticated;
    insert into auth.users (id, email) values ('${A}', 'a@x.com'), ('${B}', 'b@x.com');`);
  const wedding = (owner: string, slug: string) =>
    `insert into weddings (id, slug, bride, groom, wedding_date, reception_time, ceremony_time, venue, address)
     values (gen_random_uuid(), '${slug}', '{"en":"N","he":"נ"}', '{"en":"D","he":"ד"}', current_date + 100, '11:00', '12:30', '{"en":"V","he":"V"}', '{"en":"","he":""}') returning id`;
  const [{ id }] = await as<{ id: string }>("authenticated", A, wedding(A, "a-and-b"));
  await as("authenticated", A, `insert into invitations (wedding_id, template_id, palette, text) values ('${id}', 'classic', '{}', '{}')`);
  await as("authenticated", A, `insert into guests (wedding_id, name, phone, token, invited_adults, status) values
    ('${id}', 'Yael', '052-123-4567', 'tokenyael123', 2, 'pending'), ('${id}', 'Omer', '0541112222', 'tokenomer1234', 1, 'pending')`);
}, 60000);

describe("row level security", () => {
  it("creates a profile for each new user", async () => {
    expect((await db.query("select count(*)::int n from profiles")).rows[0]).toEqual({ n: 2 });
  });
  it("lets the owner read their guests", async () => {
    expect(await as("authenticated", A, "select name from guests order by name")).toHaveLength(2);
  });
  it("hides weddings and guests from other couples", async () => {
    expect(await as("authenticated", B, "select * from guests")).toHaveLength(0);
    expect(await as("authenticated", B, "select * from weddings")).toHaveLength(0);
  });
  it("blocks another couple from writing into the wedding", async () => {
    await expect(as("authenticated", B, "insert into guests (wedding_id, name) select id, 'Spy' from weddings")).resolves.toHaveLength(0);
    const rows = await as("authenticated", B, "update guests set name = 'hacked' returning id");
    expect(rows).toHaveLength(0);
  });
  it("denies anonymous table access entirely", async () => {
    await expect(as("anon", null, "select * from guests")).rejects.toThrow(/permission denied/);
    await expect(as("anon", null, "select * from weddings")).rejects.toThrow(/permission denied/);
    await expect(as("anon", null, "select public.apply_rsvp(null, '{}', 'x')")).rejects.toThrow(/permission denied/);
  });
  it("normalises phone numbers", async () => {
    const rows = await as<{ p: string }>("authenticated", A, "select phone_normalized p from guests where name = 'Yael'");
    expect(rows[0].p).toBe("972521234567");
  });
});

describe("guest functions", () => {
  const rpc = (sql: string) => as<{ r: Record<string, unknown> & { wedding: Record<string, unknown>; guest: Record<string, unknown> | null } }>("anon", null, `select ${sql} as r`).then((rows) => rows[0].r);

  it("returns the invitation without a guest when the token is wrong", async () => {
    const r = await rpc("get_invitation('a-and-b', 'wrongtoken000')");
    expect(r.wedding.slug).toBe("a-and-b");
    expect(r.wedding.ownerId).toBeUndefined();
    expect(r.guest).toBeNull();
  });
  it("returns only the guest's own record for a valid token", async () => {
    const r = await rpc("get_invitation('a-and-b', 'tokenyael123')");
    expect(r.guest?.name).toBe("Yael");
    expect(r.guest?.notes).toBeUndefined();
  });
  it("saves an RSVP and replaces it on a second answer", async () => {
    const payload = `'{"attending":true,"party":[{"name":"","meal":"vegan"},{"name":"Amit","meal":"hack"}],"message":"x"}'::jsonb`;
    const first = await rpc(`submit_rsvp('a-and-b', 'tokenyael123', ${payload})`);
    expect(first).toMatchObject({ status: "confirmed", attendees: 2 });
    expect(first.party).toEqual([{ name: "Yael", meal: "vegan" }, { name: "Amit", meal: "regular" }]);
    const second = await rpc(`submit_rsvp('a-and-b', 'tokenyael123', '{"attending":false}'::jsonb)`);
    expect(second).toMatchObject({ status: "declined", attendees: 0 });
    const rows = await as<{ n: number; c: number }>("authenticated", A, "select count(*)::int n, (select response_count from guests where name='Yael') c from rsvp_responses");
    expect(rows[0]).toEqual({ n: 2, c: 2 });
    expect(await as("authenticated", A, "select 1 from guests")).toHaveLength(2);
  });
  it("rejects a party larger than the invitation", async () => {
    await expect(rpc(`submit_rsvp('a-and-b', 'tokenomer1234', '{"attending":true,"party":[{"name":"a"},{"name":"b"}]}'::jsonb)`)).rejects.toThrow(/party_too_large/);
  });
  it("rejects unknown tokens", async () => {
    await expect(rpc(`submit_rsvp('a-and-b', 'nope', '{"attending":true,"party":[{"name":"a"}]}'::jsonb)`)).rejects.toThrow(/not_found/);
  });
  it("registers one record per phone through the public link", async () => {
    const p = `'{"attending":true,"party":[{"name":"Dana"},{"name":"Gil"}]}'::jsonb`;
    const one = await rpc(`submit_open_rsvp('a-and-b', 'Dana', '050-999-8888', ${p})`);
    const two = await rpc(`submit_open_rsvp('a-and-b', 'Dana K', '+972 50 999 8888', '{"attending":false}'::jsonb)`);
    expect(two.id).toBe(one.id);
    expect(two.status).toBe("declined");
    expect(await as("authenticated", A, "select 1 from guests")).toHaveLength(3);
  });
  it("lets an invited guest claim their record by phone once, but not overwrite an answer", async () => {
    const ok = await rpc(`submit_open_rsvp('a-and-b', 'Omer', '054-111-2222', '{"attending":true,"party":[{"name":"Omer"}]}'::jsonb)`);
    expect(ok.name).toBe("Omer");
    await expect(rpc(`submit_open_rsvp('a-and-b', 'X', '054-111-2222', '{"attending":false}'::jsonb)`)).rejects.toThrow(/already_responded/);
  });
  it("reports slug availability", async () => {
    expect(await rpc("is_slug_available('a-and-b')")).toBe(false);
    expect(await rpc("is_slug_available('free-slug')")).toBe(true);
  });
});
