# TrackLC — Personal LeetCode Tracker

A lightweight, fast LeetCode tracker built for studying *smarter*: spaced-repetition
review, gentle daily suggestions, and honest progress stats — across the Blind 75,
NeetCode 150, and curated company lists.

Works fully offline in your browser by default, with **optional Google sign-in** to
sync your progress to the cloud so it follows you across devices.

## Screenshots

> Add your own screenshots to `docs/screenshots/` with these names and they'll show up
> here (see [docs/screenshots/README.md](docs/screenshots/README.md) for how).

| Dashboard | Problem detail |
|-----------|----------------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Problem detail](docs/screenshots/problem-detail.png) |

| Activity log | Share snapshot |
|--------------|----------------|
| ![Activity log](docs/screenshots/activity-log.png) | ![Share](docs/screenshots/share.png) |

## Features

- **Three lists** — Blind 75, NeetCode 150, and Company-specific (Google, Meta, Amazon,
  Microsoft, Apple, Netflix), with progress synced by problem id across all of them.
- **Rating = status** — rate each problem 1–5★ (colored red→green from the on-page
  palette). No rating means unattempted; any rating marks it solved with that confidence.
- **Per-attempt history** — every time you rate a problem it logs a dated attempt. Expand
  a problem to see every date; click any date or star to **edit it**, or ✕ to remove it
  (with undo).
- **Review Queue** — spaced-repetition core. Surfaces problems rated ≤3★ or past their
  confidence-based review interval, sorted most-overdue first. Reviewing one reschedules it.
- **Daily suggestions** — a quiet, navigable rotating nudge (never a nag).
- **Stats & heatmap** — total solved by difficulty, current streak, weakest category,
  daily-goal ring, and a GitHub-style contribution grid whose accent color you can switch
  between the four Google brand colors. Hover any day for its count.
- **Responsive two-column layout** — on wide screens the stats, review queue, and heatmap
  sit in a sticky left sidebar beside the problem lists; on narrow screens everything
  stacks into one column.
- **Activity log** — pick a date range and get a day-by-day list of everything you solved
  or reviewed, with one-click plain-text copy (great for standups or study check-ins).
- **Search, filters, sort** — by name, difficulty, status, and more.
- **Flag/bookmark** any problem to revisit.
- **Dark mode** (default), keyboard shortcuts, and full keyboard accessibility.
- **Backup & restore** — Export / Import (merges, with undo) / Reset, a "Copy for Google
  Sheets" export, and a weekly backup reminder.
- **Snapshot sharing** — a dated, read-only share link (data is compressed into the URL —
  no server) plus a share card.

## Data & privacy

- **Local first.** All data is stored in your browser under the `localStorage` key
  `lc-tracker-v1`, and the app works with no account and no network.
- **Optional cloud sync.** If Google sign-in is configured (see below), signing in syncs
  your progress to your own row in a Supabase database, protected by row-level security so
  only you can read or write it. Sign-in merges cloud + local (nothing is overwritten or
  lost), then keeps them in sync.
- **Backups.** Use **Export** for an offline JSON copy, or **Copy for Google Sheets** to
  paste into a spreadsheet. Shared links are point-in-time snapshots, not live views, and
  never include your notes.

## Tech stack

Vite + React 18 + TypeScript · Tailwind CSS · lucide-react · optional Supabase
(auth + Postgres) for cloud sync. Single page with tabs — no router.

## Development

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck + production build
npm run preview    # preview the production build
npm run typecheck  # types only
```

## Optional: accounts & cloud sync

Cloud sync is off until you provide two environment variables. Without them the app runs
fully local, exactly as before. To enable Google sign-in + sync, follow
[SUPABASE_SETUP.md](SUPABASE_SETUP.md), then set:

```
VITE_SUPABASE_URL=...        # your Supabase project URL
VITE_SUPABASE_ANON_KEY=...   # the anon/public key (safe to expose; RLS protects data)
```

Locally these go in a git-ignored `.env.local`; in production, set them in your host's
environment variables (e.g. Vercel) and redeploy.

## Deployment

Any static host works (the build output is in `dist/`). This project deploys to Vercel;
pushing to `main` triggers a redeploy. Remember to add the two `VITE_SUPABASE_*` env vars
in the host if you want cloud sync on the live site.
