import { describe, expect, it } from "vitest";
import { generateLocally, mergeModelOutput, parseAiInput } from "../src/lib/ai/generate";
import { DEMO_COUNTS, buildDemoGuests, buildDemoWedding } from "../src/lib/data/demo-seed";
import { RsvpError, applyRsvp, newGuest } from "../src/lib/data/rsvp";
import { computeStats, responseTimeline } from "../src/lib/data/stats";
import { guessMapping, parseCsv, rowsToGuests } from "../src/lib/guest-io";
import { buildGuestMessage, renderMessage } from "../src/lib/messaging/templates";
import { whatsappLink } from "../src/lib/messaging/provider";
import { TEMPLATES, resolvePalette } from "../src/lib/templates";
import { contrastRatio, coupleSlug, formatPhone, hebrewCalendarDate, normalizePhone } from "../src/lib/utils";

const now = Date.UTC(2026, 10, 16);
const guests = buildDemoGuests(now);
const wedding = buildDemoWedding(now);

describe("demo wedding", () => {
  it("matches the brief exactly", () => {
    const s = computeStats(guests);
    expect([s.total, s.confirmed, s.declined, s.pending, s.notContacted]).toEqual([DEMO_COUNTS.total, 218, 42, 90, 0]);
    expect(s.responseRate).toBeCloseTo(260 / 350);
    expect(s.attendees).toBe(guests.reduce((n, g) => n + g.party.length, 0));
  });
  it("has unique names, phones and tokens, and is deterministic", () => {
    for (const key of ["name", "phone", "token"] as const) expect(new Set(guests.map((g) => g[key])).size).toBe(350);
    expect(buildDemoGuests(now + 999).map((g) => g.token)).toEqual(guests.map((g) => g.token));
  });
  it("produces a timeline that adds up", () => {
    const t = responseTimeline(guests, "week", new Date(now));
    expect(t[t.length - 1].totalConfirmed).toBe(218);
    expect(t[t.length - 1].totalDeclined).toBe(42);
  });
});

describe("rsvp", () => {
  const guest = newGuest("w", { name: "Yael", invitedAdults: 2 });
  it("confirms, then replaces the answer without duplicating", () => {
    const yes = applyRsvp(guest, { attending: true, party: [{ name: "", meal: "vegan" }, { name: "Amit", meal: "regular" }], specialRequests: "", message: "" });
    expect(yes).toMatchObject({ status: "confirmed", attendees: 2, responseCount: 1 });
    expect(yes.party[0].name).toBe("Yael");
    const no = applyRsvp(yes, { attending: false, party: [], specialRequests: "", message: "sorry" });
    expect(no).toMatchObject({ id: guest.id, status: "declined", attendees: 0, responseCount: 2 });
  });
  it("refuses more people than invited", () => {
    const party = [1, 2, 3].map((n) => ({ name: `g${n}`, meal: "regular" as const }));
    expect(() => applyRsvp(guest, { attending: true, party, specialRequests: "", message: "" })).toThrow(RsvpError);
  });
});

describe("phones, slugs, dates", () => {
  it("normalises Israeli numbers", () => {
    expect(normalizePhone("052-123-4567")).toBe("972521234567");
    expect(normalizePhone("+972 52 123 4567")).toBe("972521234567");
    expect(formatPhone("972521234567")).toBe("052-123-4567");
  });
  it("builds readable slugs", () => {
    expect(coupleSlug("Daniel", "Noa")).toBe("daniel-and-noa");
    expect(coupleSlug("דניאל", "נועה")).toMatch(/^[a-z0-9-]+$/);
  });
  it("writes the Hebrew calendar date", () => expect(hebrewCalendarDate("2027-06-18")).toBe("י״ג בסיוון תשפ״ז"));
});

describe("messaging", () => {
  it("fills variables and leaves unknown ones visible", () => {
    expect(renderMessage("Hi {{guest_name}} {{nope}}", { guest_name: "Yael" })).toBe("Hi Yael {{nope}}");
    const text = buildGuestMessage("invite", wedding, guests[0], "en", "https://vow.app");
    expect(text).toContain(`https://vow.app/invite/daniel-and-noa?g=${guests[0].token}`);
    expect(text).toContain("Noa & Daniel");
    expect(whatsappLink("052-123-4567", "a b")).toBe("https://wa.me/972521234567?text=a%20b");
  });
});

describe("import", () => {
  it("parses quoted CSV, maps columns and skips duplicates", () => {
    const rows = parseCsv('﻿Name,Phone,Group,Adults\n"Shapiro, Yael",052-123-4567,Family,2\nNo Phone,,Friends,1\n,050,,\nDup,0521234567,,1\n');
    expect(rows[1][0]).toBe("Shapiro, Yael");
    const result = rowsToGuests(rows.slice(1), guessMapping(rows[0]), "w", []);
    expect(result.guests.map((g) => g.name)).toEqual(["Shapiro, Yael", "No Phone"]);
    expect(result).toMatchObject({ skippedEmpty: 1, skippedDuplicates: 1 });
    expect(result.guests[0]).toMatchObject({ phone: "972521234567", invitedAdults: 2, status: "not_contacted", source: "import" });
  });
});

describe("ai", () => {
  const input = parseAiInput({ bride: "Maya", groom: "Jon", style: "romantic", colors: ["blush", "bogus"], date: "2027-09-09" })!;
  it("validates input", () => {
    expect(parseAiInput({ bride: "", groom: "x" })).toBeNull();
    expect(input.colors).toEqual(["blush"]);
  });
  it("composes bilingual wording and ranks designs", () => {
    const r = generateLocally(input);
    expect(r.variants).toHaveLength(3);
    expect(r.templates[0].id).toBe("garden");
    expect(r.intros[0].he).toContain("Maya");
    expect(r.palettes.length).toBeGreaterThan(1);
  });
  it("keeps only well-formed model output", () => {
    const r = mergeModelOutput({ variants: [{ en: { opening: "a" } }], palettes: [{ bg: "red" }, { name_en: "P", bg: "#ffffff", ink: "#111111", accent: "#aa8844", soft: "#eeeeee" }], templates: [{ id: "fake" }, { id: "royal", score: 95 }] }, input);
    expect(r.source).toBe("claude");
    expect(r.variants).toHaveLength(3);
    expect(r.palettes[0].name.en).toBe("P");
    expect(r.templates[0].id).toBe("royal");
  });
});

describe("palettes", () => {
  it("keep body text and small accent text readable on every design", () => {
    for (const t of TEMPLATES) for (const p of t.palettes) {
      const r = resolvePalette(p);
      expect(contrastRatio(r.ink, r.bg), `${t.id}/${p.id} ink`).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(r.accentText, r.bg), `${t.id}/${p.id} accent`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
