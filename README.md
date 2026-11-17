# VOW

AI wedding invitations and guest management: animated digital invitations, personal RSVP
links, WhatsApp sharing and a real-time dashboard for the couple. Hebrew (RTL) and English.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

No configuration is needed. Without environment variables the app runs in **demo mode**:
the Noa & Daniel wedding (350 invitations: 218 confirmed, 42 declined, 90 pending) is
seeded into the browser's local storage and everything is fully interactive. Open the
dashboard in one tab and an invitation in another to watch replies arrive live.

| Path | What it is |
| --- | --- |
| `/en`, `/he` | Landing page |
| `/en/templates` | Six invitation designs with an interactive preview |
| `/en/create` | AI creation wizard with live preview |
| `/invite/daniel-and-noa` | The animated invitation (public link) |
| `/invite/daniel-and-noa?g=<token>` | A guest's personal invitation and RSVP |
| `/en/dashboard` | Overview, guests, analytics, WhatsApp, invitation editor |

```bash
npm test           # unit tests + the SQL migration and RLS policies in embedded Postgres
npm run lint
npm run typecheck
npm run build
```

## Going live

Copy `.env.example` to `.env.local`.

**Supabase (database, auth, realtime, storage).** Create a project, run
`supabase/migrations/20261116000000_init.sql` in the SQL editor, then set
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The app switches from the
demo store to Supabase automatically; both implement the same `Repository` interface
(`src/lib/data/repository.ts`).

- Tables: `profiles`, `weddings`, `invitations`, `guests`, `rsvp_responses`,
  `invitation_templates`.
- Row Level Security: a couple can only read and write rows of weddings they own. The
  anon key has no table access at all.
- Guests never query tables. They call `get_invitation`, `submit_rsvp` and
  `submit_open_rsvp`, which take the wedding slug plus the guest's unguessable token and
  return only that guest's own record. Answering again updates the same row, and every
  answer is appended to `rsvp_responses`.
- Realtime: the dashboard subscribes to its own `guests` rows.

`tests/sql.test.ts` runs this migration and checks the policies and functions, but the
Supabase client code itself has not been run against a hosted project yet. Do a pass on
sign-up, publishing and an RSVP after connecting one.

**AI.** Set `ANTHROPIC_API_KEY` to have Claude write the wording, introduction, design
ranking and palettes (`src/app/api/ai/generate/route.ts`). Output is validated field by
field; on any failure the built-in bilingual composer answers instead. The route has only
a basic in-memory rate limit: put a proper limiter in front of it before launch.

**WhatsApp.** Messages use `wa.me` links: WhatsApp opens with the personalised text ready
and the couple presses send. `src/lib/messaging/provider.ts` defines the provider
interface, and `/api/whatsapp/send` is the server side of a WhatsApp Business Cloud API
provider. That route is written but has not been tested against Meta's API.

## Before launch

- **Photography.** The demo artwork in `public/demo/` is illustration, not photography.
  Replace it with real photos (the hero background is set in
  `src/components/site/landing.tsx`).
- **Legal pages.** `/privacy` and `/accessibility` are drafts and say so on the page.
  They need a lawyer's review and the operator's contact details.
- Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_SUPPORT_EMAIL`.

## Structure

```
src/app/[lang]/         localised pages (en, he); src/proxy.ts picks the locale
src/app/invite/[slug]/  the invitation, in the wedding's own language
src/app/api/            AI generation, WhatsApp Cloud API
src/components/invitation/  card designs, envelope, particles, RSVP
src/components/dashboard/   overview, guests table, analytics, messages
src/components/studio/      wizard and invitation editor
src/lib/data/           repository interface, demo store, Supabase store, stats
supabase/migrations/    schema, RLS, guest-facing functions
```
