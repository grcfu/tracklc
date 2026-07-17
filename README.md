# TrackLC — Personal LeetCode Tracker

A lightweight, fast, **fully client-side** LeetCode tracker. No backend, no login, no external APIs. All your data lives in your browser's `localStorage`.

Built for studying *smarter*: spaced-repetition review, gentle daily suggestions, and honest progress stats — with the Blind 75, NeetCode 150, and curated company lists.

## Features

- **Three lists** — Blind 75, NeetCode 150, and Company-specific (Google, Meta, Amazon, Microsoft, Apple, Netflix), with progress synced by problem id across all of them.
- **Rating = status** — rate each problem 1–5★. No rating means unattempted; any rating marks it solved with that confidence.
- **Review Queue** — spaced-repetition core. Surfaces problems rated ≤3★ or past their confidence-based review interval, sorted most-overdue first.
- **Daily suggestions** — a quiet, navigable rotating nudge (never a nag).
- **Stats & heatmap** — solved-by-difficulty, current streak, weakest category, daily-goal ring, and a GitHub-style contribution grid.
- **Search, filters, sort** — by name, difficulty, status, and more.
- **Flag/bookmark** any problem to revisit.
- **Dark mode**, keyboard shortcuts, and full keyboard accessibility.
- **Export / Import / Reset** with an undo safety net, plus **snapshot sharing** (a dated, read-only share link + share card).

## Data & privacy

Everything is stored **only in this browser** under the `localStorage` key `lc-tracker-v1`. Clearing your browser data will erase it — use **Export** to keep a backup. Shared links are point-in-time snapshots, not live views.

## Tech stack

Vite + React 18 + TypeScript · Tailwind CSS · lucide-react. No other runtime dependencies. No router (single page with tabs).

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm run preview  # preview the production build
```
