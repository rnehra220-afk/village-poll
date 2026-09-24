# Village Poll — Unofficial Village Opinion Poll Platform

A production-structured **Next.js 14 + Supabase** web app for creating and sharing
unofficial village-level public opinion polls (Sarpanch / Ward Panch / Zila Parishad Member).

> **This is an unofficial opinion-poll platform.** It is not an official election website,
> not affiliated with the Election Commission of India, and votes here are not official
> election votes. This disclaimer is shown throughout the site.

## Features (MVP)

- **Poll creation wizard** (4 steps): location → poll type → candidates → preview → publish
- **Location flow**: State dropdown (28 states + 8 UTs) → District (manual entry, clearly
  labelled) → Block (optional) → Village → **“Enter Village Manually”** fallback.
  Manually entered villages are stored as `source = 'custom_user_entry'` and never
  presented as verified government data.
- **Unique shareable poll URLs** (`/poll/<slug>`), WhatsApp / Telegram / Facebook /
  copy-link share, native share, **QR code** with download, dynamic OG social images
- **Voting**: no registration; one vote per poll session/device enforced by a
  `UNIQUE(poll_id, voter_hash)` database constraint + IP rate limiting + honeypot
- **Live results** with animated bars, total votes & percentages, auto-refresh
- **Creator management** via private token link (`/m/<token>`): stats, close/reopen, delete
- **“My Polls”** on-device list, **poll search**, **trending/recent** sections
- **SEO**: dynamic titles/meta, canonicals, Open Graph/Twitter cards, XML sitemap,
  robots.txt, JSON-LD (WebSite, FAQ, Breadcrumb, CollectionPage), state & district pages
  (`/rajasthan`, `/rajasthan/jaipur`), GSC verification via `GSC_VERIFICATION` env
- **Admin panel** (`/admin`): metrics, votes/day chart, poll moderation
  (hide/restore/close/delete), report queue, custom-village approval queue
- **Report-a-poll** on every public poll page
- **Ad slots A–E** as labelled placeholders (homepage top, poll content divider,
  below results, desktop sidebar, mobile sticky) — layouts are built around real ad sizes
- **English + Hindi** UI toggle (full dictionary in `lib/i18n.js`)
- **PWA manifest**, mobile-first design, 48px touch targets, security headers
- Legal pages: Privacy, Terms, Cookies, Community Guidelines, Contact

## Tech

- Next.js 14 (App Router) + React 18 + Tailwind CSS
- Supabase (Postgres) — schema in `supabase/migrations/001_schema.sql`
- `qrcode.react` for QR codes, `next/og` for social images

## Deploy (about 20 minutes, all free tier)

### 1. Create the database (Supabase)

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is enough to start).
2. Open **SQL Editor** → paste the entire contents of
   `supabase/migrations/001_schema.sql` → **Run**.
   This creates tables (`polls`, `candidates`, `votes`, `villages`, `reports`,
   `poll_events`), indexes and Row-Level Security policies.
3. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (never expose in the browser)

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **server only** — all writes go through API routes |
| `ADMIN_PASSWORD` | yes | password for `/admin/login` (pick a strong one) |
| `SITE_URL` | yes | e.g. `https://yourdomain.com` (no trailing slash) |
| `VOTE_SALT` | recommended | long random string for voter hashes |
| `NEXT_PUBLIC_CONTACT_EMAIL` | optional | shown on Contact page |
| `GSC_VERIFICATION` | optional | Google Search Console meta code |
| `ADS_ENABLED` | optional | `true`/`false`, default true |

### 3. Deploy the app (Vercel — recommended)

1. Push this folder to a GitHub repo (or drag-drop via Vercel CLI).
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Add the environment variables from step 2.
4. **Deploy.** Vercel gives you a `*.vercel.app` URL; add a custom domain later in
   **Settings → Domains**.

Alternative: any Node.js host — `npm install && npm run build && npm start`.

### 4. Verify

- Open the site → create a test poll → vote from your phone → check results update.
- Open `/admin/login`, sign in with `ADMIN_PASSWORD`, check the overview.
- Submit the sitemap (`https://yourdomain.com/sitemap.xml`) in Google Search Console.

## How voting & anti-abuse works (honest summary)

- Each browser gets an anonymous random session id (`vpid` httpOnly cookie).
- `voter_hash = sha256(poll_id + session_id + server_secret)`; the database
  **unique constraint** on `(poll_id, voter_hash)` makes a second vote from the same
  session/device impossible at the data layer.
- Additional layers: per-IP rate limits on voting/reporting/creation, honeypot field
  on the create form, IP hashes stored only for abuse detection and never exposed.
- We deliberately do **not** claim “one human = one vote” — the UI says
  “one vote per poll session/device; duplicate and suspicious voting is restricted.”

## Ad monetization

`components/AdSlot.js` renders labelled placeholders sized for 300×250, 320×50,
728×90 etc. To go live with AdSense (or another network):

1. Get approved and copy your ad code.
2. Paste the **reviewed** snippet into `AD_NETWORK_SNIPPET` in `lib/ads.js` and render
   it inside `AdSlot` (see comments in the file), or replace the placeholder markup.
3. Keep the rules in the component: ads must never cover voting buttons or look like
   voting controls.

## Project structure

```
app/                    pages & API routes (App Router)
  api/                  polls, vote, results, search, reports, admin, manage, trending
  poll/[slug]/         public poll page + opengraph-image.js (social preview)
  create/ search/ my-polls/ m/[token]/   creation wizard, search, device polls, creator manage
  admin/                login + moderation dashboard
  [state]/ [state]/[district]/           SEO district pages
  privacy/ terms/ cookies/ guidelines/ contact/
  sitemap.js robots.js manifest.js
components/             Header, Footer, ShareButtons, QRCodeModal, ResultBars,
                        ReportModal, AdSlot, DisclaimerBox, PollCard, CreateWizard,
                        PollView, SearchClient, MyPollsClient, ManageClient, AdminDashboard
lib/                    supabase clients, i18n (en+hi), geo, validation,
                        rate-limit, tokens, ads config, constants
supabase/migrations/   001_schema.sql — run once in Supabase SQL editor
public/data/geo.json    states list (districts/villages are user-entered)
```

## Security notes

- The **service role key is used only in API routes** (`lib/supabase.js`
  `getServiceClient`). RLS denies all direct anon writes; public reads are limited to
  active/closed polls, their candidates, and approved villages.
- Admin sessions are HMAC-signed httpOnly cookies (12 h), not JWTs.
- Never commit `.env.local`. Rotate `ADMIN_PASSWORD` / `VOTE_SALT` if ever exposed.

## Not in MVP (Phase 2 ideas)

Email/Google login for creators, OTP, advanced fraud detection, per-day analytics
charts beyond the admin overview, full Hindi legal pages, auto-imported official
village database (currently: manual entry, honestly labelled), CAPTCHA provider
integration (honeypot + rate limits are in place; see `app/api/polls/route.js`).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase keys
npm run dev                  # http://localhost:3000
npm run build                # production build check
```
