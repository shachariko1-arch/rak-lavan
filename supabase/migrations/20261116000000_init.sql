-- VOW · initial schema
--
-- Entities: profiles (users), weddings, invitations, guests, rsvp_responses, invitation_templates.
--
-- Security model
--   • Couples sign in with Supabase Auth. Row Level Security limits every table to the
--     rows of weddings they own. Nothing here is readable with the anon key directly.
--   • Guests never query tables. They call three SECURITY DEFINER functions that take the
--     wedding slug plus their own unguessable token, and return only what an invitation
--     page needs. A guest can read and change their own RSVP and nobody else's.

create extension if not exists pgcrypto;

/* ───────────────────────────── helpers ───────────────────────────── */

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

-- Digits only, international form. Mirrors normalizePhone() in src/lib/utils.ts.
create or replace function public.normalize_phone(p_phone text)
returns text
language sql
immutable
as $$
  select case
    when d like '00%' then substr(d, 3)
    when d like '0%' then '972' || substr(d, 2)
    else d
  end
  from (select regexp_replace(coalesce(p_phone, ''), '\D', '', 'g') as d) s
$$;

/* ───────────────────────────── tables ───────────────────────────── */

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.invitation_templates (
  id text primary key,
  name jsonb not null,
  tagline jsonb not null,
  default_palette jsonb not null,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 3 and 60),
  bride jsonb not null,
  groom jsonb not null,
  bride_last jsonb not null default '{"en":"","he":""}',
  groom_last jsonb not null default '{"en":"","he":""}',
  wedding_date date not null,
  reception_time text not null check (reception_time ~ '^\d{2}:\d{2}$'),
  ceremony_time text not null check (ceremony_time ~ '^\d{2}:\d{2}$'),
  venue jsonb not null,
  address jsonb not null,
  language text not null default 'he' check (language in ('en', 'he')),
  style text not null default 'classic',
  colors text[] not null default '{}',
  rsvp_deadline date,
  allow_open_rsvp boolean not null default true,
  message_templates jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index weddings_owner_idx on public.weddings (owner_id);

-- The design and wording of a wedding's invitation. One per wedding.
create table public.invitations (
  wedding_id uuid primary key references public.weddings (id) on delete cascade,
  template_id text not null references public.invitation_templates (id),
  palette jsonb not null,
  text jsonb not null,
  intro jsonb not null default '{"en":"","he":""}',
  personal_message text not null default '',
  photos text[] not null default '{}',
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  -- The secret in a guest's personal link.
  token text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 20)
    check (length(token) >= 10),
  name text not null check (length(name) between 1 and 120),
  name_he text,
  phone text not null default '',
  phone_normalized text generated always as (public.normalize_phone(phone)) stored,
  group_name text not null default '',
  group_name_he text,
  category text not null default 'friends' check (category in ('family', 'friends', 'work', 'other')),
  side text not null default 'both' check (side in ('bride', 'groom', 'both')),
  invited_adults int not null default 1 check (invited_adults between 0 and 30),
  invited_children int not null default 0 check (invited_children between 0 and 30),
  plus_one boolean not null default false,
  status text not null default 'not_contacted'
    check (status in ('confirmed', 'declined', 'pending', 'not_contacted')),
  attendees int not null default 0 check (attendees >= 0),
  party jsonb not null default '[]',
  special_requests text not null default '',
  message text not null default '',
  table_name text not null default '',
  notes text not null default '',
  invitation_sent_at timestamptz,
  last_response_at timestamptz,
  reminders_sent int not null default 0,
  response_count int not null default 0,
  source text not null default 'host' check (source in ('host', 'import', 'public_link')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index guests_wedding_idx on public.guests (wedding_id);
create index guests_wedding_phone_idx on public.guests (wedding_id, phone_normalized);
-- One self-registered record per phone number per wedding.
create unique index guests_public_phone_uniq on public.guests (wedding_id, phone_normalized)
  where source = 'public_link' and phone_normalized <> '';

-- Every answer a guest has ever given. guests holds the current one; this is the history.
create table public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests (id) on delete cascade,
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  attending boolean not null,
  attendees int not null default 0,
  party jsonb not null default '[]',
  special_requests text not null default '',
  message text not null default '',
  via text not null default 'personal_link' check (via in ('personal_link', 'public_link', 'host')),
  created_at timestamptz not null default now()
);
create index rsvp_responses_guest_idx on public.rsvp_responses (guest_id, created_at desc);
create index rsvp_responses_wedding_idx on public.rsvp_responses (wedding_id, created_at desc);

create trigger weddings_touch before update on public.weddings
  for each row execute function public.touch_updated_at();
create trigger invitations_touch before update on public.invitations
  for each row execute function public.touch_updated_at();
create trigger guests_touch before update on public.guests
  for each row execute function public.touch_updated_at();

-- A profile row for every new account.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

/* ───────────────────────────── row level security ───────────────────────────── */

alter table public.profiles enable row level security;
alter table public.invitation_templates enable row level security;
alter table public.weddings enable row level security;
alter table public.invitations enable row level security;
alter table public.guests enable row level security;
alter table public.rsvp_responses enable row level security;

-- Guests use the functions below, never the tables.
revoke all on public.profiles, public.weddings, public.invitations, public.guests, public.rsvp_responses from anon;
grant select on public.invitation_templates to anon, authenticated;
grant select, insert, update, delete on public.weddings, public.invitations, public.guests to authenticated;
grant select on public.rsvp_responses to authenticated;
grant select, update on public.profiles to authenticated;

create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy templates_read on public.invitation_templates
  for select to anon, authenticated using (is_active);

create policy weddings_owner_all on public.weddings
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy invitations_owner_all on public.invitations
  for all to authenticated
  using (exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = (select auth.uid())));

create policy guests_owner_all on public.guests
  for all to authenticated
  using (exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = (select auth.uid())));

create policy rsvp_responses_owner_read on public.rsvp_responses
  for select to authenticated
  using (exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = (select auth.uid())));

/* ───────────────────────────── guest-facing functions ───────────────────────────── */

-- What an invitation page may know about a wedding. No owner, no message templates.
create or replace function public.wedding_public_json(w public.weddings, i public.invitations)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', w.id,
    'slug', w.slug,
    'bride', w.bride,
    'groom', w.groom,
    'brideLast', w.bride_last,
    'groomLast', w.groom_last,
    'date', to_char(w.wedding_date, 'YYYY-MM-DD'),
    'receptionTime', w.reception_time,
    'ceremonyTime', w.ceremony_time,
    'venue', w.venue,
    'address', w.address,
    'language', w.language,
    'style', w.style,
    'colors', to_jsonb(w.colors),
    'templateId', i.template_id,
    'palette', i.palette,
    'text', i.text,
    'intro', i.intro,
    'personalMessage', i.personal_message,
    'photos', to_jsonb(i.photos),
    'rsvpDeadline', case when w.rsvp_deadline is null then null else to_char(w.rsvp_deadline, 'YYYY-MM-DD') end,
    'allowOpenRsvp', w.allow_open_rsvp,
    'createdAt', w.created_at
  )
$$;

-- What a guest may know about their own record. No notes, table, group or host-side fields.
create or replace function public.guest_public_json(g public.guests)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', g.id,
    'token', g.token,
    'name', g.name,
    'nameHe', g.name_he,
    'phone', g.phone,
    'invitedAdults', g.invited_adults,
    'invitedChildren', g.invited_children,
    'plusOne', g.plus_one,
    'status', g.status,
    'attendees', g.attendees,
    'party', g.party,
    'specialRequests', g.special_requests,
    'message', g.message,
    'lastResponseAt', g.last_response_at
  )
$$;

-- Validates an RSVP, stores it on the guest and appends it to the history.
create or replace function public.apply_rsvp(g public.guests, p_payload jsonb, p_via text)
returns public.guests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attending boolean := (p_payload -> 'attending') = 'true'::jsonb;
  v_party jsonb := '[]'::jsonb;
  v_limit int := greatest(1, g.invited_adults + g.invited_children + (case when g.plus_one then 1 else 0 end));
  v_member jsonb;
  v_name text;
  v_meal text;
  v_count int := 0;
  v_requests text := left(btrim(coalesce(p_payload ->> 'specialRequests', '')), 500);
  v_message text := left(btrim(coalesce(p_payload ->> 'message', '')), 500);
  v_result public.guests;
begin
  if v_attending then
    if jsonb_typeof(p_payload -> 'party') is distinct from 'array'
       or jsonb_array_length(p_payload -> 'party') = 0 then
      raise exception 'invalid' using errcode = 'P0001';
    end if;
    if jsonb_array_length(p_payload -> 'party') > v_limit then
      raise exception 'party_too_large' using errcode = 'P0001';
    end if;
    for v_member in select value from jsonb_array_elements(p_payload -> 'party') loop
      v_name := left(btrim(coalesce(v_member ->> 'name', '')), 80);
      if v_count = 0 and v_name = '' then
        v_name := g.name;
      end if;
      v_meal := coalesce(v_member ->> 'meal', 'regular');
      if v_meal not in ('regular', 'vegetarian', 'vegan', 'gluten_free', 'kosher_mehadrin', 'kids', 'allergy') then
        v_meal := 'regular';
      end if;
      v_party := v_party || jsonb_build_array(
        case when (v_member -> 'isChild') = 'true'::jsonb
          then jsonb_build_object('name', v_name, 'meal', v_meal, 'isChild', true)
          else jsonb_build_object('name', v_name, 'meal', v_meal)
        end
      );
      v_count := v_count + 1;
    end loop;
  end if;

  update public.guests
  set status = case when v_attending then 'confirmed' else 'declined' end,
      attendees = v_count,
      party = v_party,
      special_requests = v_requests,
      message = v_message,
      last_response_at = now(),
      invitation_sent_at = coalesce(invitation_sent_at, now()),
      response_count = response_count + 1
  where id = g.id
  returning * into v_result;

  insert into public.rsvp_responses (guest_id, wedding_id, attending, attendees, party, special_requests, message, via)
  values (g.id, g.wedding_id, v_attending, v_count, v_party, v_requests, v_message, p_via);

  return v_result;
end
$$;

create or replace function public.get_invitation(p_slug text, p_token text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  w public.weddings;
  i public.invitations;
  g public.guests;
begin
  select * into w from public.weddings where slug = lower(p_slug);
  if not found then
    return null;
  end if;
  select * into i from public.invitations where wedding_id = w.id;
  if not found then
    return null;
  end if;
  if p_token is not null and length(p_token) >= 10 then
    select * into g from public.guests where wedding_id = w.id and token = p_token;
  end if;
  return jsonb_build_object(
    'wedding', public.wedding_public_json(w, i),
    'guest', case when g.id is null then null else public.guest_public_json(g) end
  );
end
$$;

-- Answer (or re-answer) through a personal link. Always updates the same guest row.
create or replace function public.submit_rsvp(p_slug text, p_token text, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.weddings;
  g public.guests;
begin
  select * into w from public.weddings where slug = lower(p_slug);
  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  if current_date > w.wedding_date then
    raise exception 'deadline_passed' using errcode = 'P0001';
  end if;
  select * into g from public.guests
  where wedding_id = w.id and token = p_token and length(coalesce(p_token, '')) >= 10
  for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  g := public.apply_rsvp(g, p_payload, 'personal_link');
  return public.guest_public_json(g);
end
$$;

-- Answer through the public link, identified by phone number. One record per phone.
create or replace function public.submit_open_rsvp(p_slug text, p_name text, p_phone text, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.weddings;
  g public.guests;
  v_name text := left(btrim(coalesce(p_name, '')), 80);
  v_phone text := public.normalize_phone(p_phone);
  v_attending boolean := (p_payload -> 'attending') = 'true'::jsonb;
  v_size int := 1;
begin
  select * into w from public.weddings where slug = lower(p_slug);
  if not found or not w.allow_open_rsvp then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  if current_date > w.wedding_date then
    raise exception 'deadline_passed' using errcode = 'P0001';
  end if;
  if v_name = '' then
    raise exception 'invalid' using errcode = 'P0001';
  end if;
  if length(v_phone) < 9 or length(v_phone) > 15 then
    raise exception 'phone_required' using errcode = 'P0001';
  end if;
  if v_attending and jsonb_typeof(p_payload -> 'party') = 'array' then
    v_size := greatest(1, jsonb_array_length(p_payload -> 'party'));
  end if;

  select * into g from public.guests
  where wedding_id = w.id and phone_normalized = v_phone
  order by (source = 'public_link') desc, created_at
  limit 1
  for update;

  if found then
    -- Invited by name and already answered through their own link: do not let a phone number overwrite it.
    if g.source <> 'public_link' and g.response_count > 0 then
      raise exception 'already_responded' using errcode = 'P0001';
    end if;
    if g.source = 'public_link' then
      if v_size > 6 then
        raise exception 'party_too_large' using errcode = 'P0001';
      end if;
      update public.guests
      set name = v_name, invited_adults = greatest(invited_adults, v_size)
      where id = g.id
      returning * into g;
    end if;
  else
    if v_size > 6 then
      raise exception 'party_too_large' using errcode = 'P0001';
    end if;
    insert into public.guests (wedding_id, name, phone, group_name, group_name_he, category, side, invited_adults, source)
    values (w.id, v_name, v_phone, 'Public link', 'קישור כללי', 'other', 'both', v_size, 'public_link')
    returning * into g;
  end if;

  g := public.apply_rsvp(g, p_payload, 'public_link');
  return public.guest_public_json(g);
end
$$;

create or replace function public.is_slug_available(p_slug text, p_except uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.weddings
    where slug = lower(p_slug) and (p_except is null or id <> p_except)
  )
$$;

-- Internal helpers are not callable from the API.
revoke all on function public.apply_rsvp(public.guests, jsonb, text) from public, anon, authenticated;
revoke all on function public.wedding_public_json(public.weddings, public.invitations) from public, anon, authenticated;
revoke all on function public.guest_public_json(public.guests) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

revoke all on function public.get_invitation(text, text) from public;
revoke all on function public.submit_rsvp(text, text, jsonb) from public;
revoke all on function public.submit_open_rsvp(text, text, text, jsonb) from public;
revoke all on function public.is_slug_available(text, uuid) from public;
grant execute on function public.get_invitation(text, text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, jsonb) to anon, authenticated;
grant execute on function public.submit_open_rsvp(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.is_slug_available(text, uuid) to anon, authenticated;

/* ───────────────────────────── realtime ───────────────────────────── */

-- Dashboards subscribe to their own guests. RLS applies to realtime, so a couple only
-- ever receives changes for weddings they own.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.guests;
  end if;
end
$$;

/* ───────────────────────────── storage ───────────────────────────── */

-- Couple photos. Publicly readable (they appear on the invitation); writable only inside
-- the uploader's own folder: wedding-media/<user id>/<wedding id>/<file>.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    insert into storage.buckets (id, name, public)
    values ('wedding-media', 'wedding-media', true)
    on conflict (id) do nothing;

    execute $p$
      create policy wedding_media_read on storage.objects
        for select using (bucket_id = 'wedding-media')
    $p$;
    execute $p$
      create policy wedding_media_insert on storage.objects
        for insert to authenticated
        with check (bucket_id = 'wedding-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
    $p$;
    execute $p$
      create policy wedding_media_update on storage.objects
        for update to authenticated
        using (bucket_id = 'wedding-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
    $p$;
    execute $p$
      create policy wedding_media_delete on storage.objects
        for delete to authenticated
        using (bucket_id = 'wedding-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
    $p$;
  end if;
end
$$;

/* ───────────────────────────── template catalogue ───────────────────────────── */

insert into public.invitation_templates (id, name, tagline, default_palette, sort_order) values
  ('classic',
   '{"en":"Classic Luxury","he":"קלאסי יוקרתי"}',
   '{"en":"Engraved elegance, timeless proportions","he":"אלגנטיות חרוטה בפרופורציות על־זמניות"}',
   '{"id":"ivory-gold","bg":"#fbf7ef","ink":"#2a241c","accent":"#a8843f","soft":"#f1e8d8"}', 1),
  ('minimal',
   '{"en":"Modern Minimal","he":"מודרני מינימליסטי"}',
   '{"en":"Space, type and nothing else","he":"חלל, טיפוגרפיה ותו לא"}',
   '{"id":"paper-white","bg":"#ffffff","ink":"#111111","accent":"#111111","soft":"#f2f0ec"}', 2),
  ('garden',
   '{"en":"Romantic Garden","he":"גן רומנטי"}',
   '{"en":"Botanicals that grow as you read","he":"צמחייה שצומחת תוך כדי קריאה"}',
   '{"id":"blush-garden","bg":"#fbf4f0","ink":"#3b3230","accent":"#74876a","soft":"#f2dfd8","accent2":"#d9a9a0"}', 3),
  ('mediterranean',
   '{"en":"Mediterranean","he":"ים תיכוני"}',
   '{"en":"Whitewash, cobalt and late sun","he":"סיד לבן, קובלט ושמש של אחר צהריים"}',
   '{"id":"santorini","bg":"#fdfcf8","ink":"#1b2b4b","accent":"#2f5da8","soft":"#e3ebf6","accent2":"#e0a23a"}', 4),
  ('royal',
   '{"en":"Royal Gold","he":"זהב מלכותי"}',
   '{"en":"Foil, velvet and a sense of occasion","he":"פויל, קטיפה ותחושת אירוע"}',
   '{"id":"emerald-gold","bg":"#0e2a22","ink":"#f3e9d2","accent":"#d4b36a","soft":"#153a2f"}', 5),
  ('editorial',
   '{"en":"Editorial Black & White","he":"אדיטוריאל שחור־לבן"}',
   '{"en":"Your wedding, as a magazine cover","he":"החתונה שלכם, כמו שער של מגזין"}',
   '{"id":"black-white","bg":"#0c0c0c","ink":"#f7f5f1","accent":"#f7f5f1","soft":"#1a1a1a"}', 6)
on conflict (id) do nothing;
