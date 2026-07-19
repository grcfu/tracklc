# Accounts & cloud sync (Supabase) — setup

TrackLC now supports optional **Google sign-in + cloud sync**. Until the two
env vars below are set, the app runs exactly as before (local-only). Once set,
signing in loads your progress from the cloud and auto-saves every change, so
your data survives a wiped browser or a new device.

Do these steps once (~10 min).

## 1. Create a Supabase project
1. Go to https://supabase.com → sign in → **New project**.
2. Pick a name + a strong database password, choose a region, create it.
3. When it's ready, go to **Project Settings → API** and copy:
   - **Project URL** (e.g. `https://abcdxyz.supabase.co`)
   - **anon public** key (safe to embed in a frontend)

## 2. Create the table + security rules
In the Supabase dashboard → **SQL Editor** → New query → paste and run:

```sql
create table if not exists public.tracklc_stores (
  user_id    uuid primary key references auth.users on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.tracklc_stores enable row level security;

create policy "Users read own store"
  on public.tracklc_stores for select
  using (auth.uid() = user_id);

create policy "Users insert own store"
  on public.tracklc_stores for insert
  with check (auth.uid() = user_id);

create policy "Users update own store"
  on public.tracklc_stores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Row-level security means each account can only ever read/write **its own** row.

## 3. Enable Google sign-in
1. Supabase → **Authentication → Providers → Google** → toggle **Enable**. Note
   the **Callback URL** it shows (`https://<ref>.supabase.co/auth/v1/callback`).
2. Google Cloud Console (https://console.cloud.google.com) → create/select a
   project → **APIs & Services → Credentials → Create credentials → OAuth client
   ID → Web application**.
   - **Authorized redirect URIs**: paste the Supabase Callback URL from step 1.
   - Create it, then copy the **Client ID** and **Client secret**.
3. Back in Supabase's Google provider settings, paste the **Client ID** and
   **Client secret**, and save.
4. Supabase → **Authentication → URL Configuration**:
   - **Site URL**: your deployed URL (e.g. `https://tracklc.vercel.app`).
   - **Redirect URLs**: add both `http://localhost:5173` (dev) and your deployed
     URL, so sign-in redirects back correctly in both places.

## 4. Add the two keys
**Local dev** — create a file named `.env.local` in the project root (it's
git-ignored, so it never gets committed):

```
VITE_SUPABASE_URL=https://abcdxyz.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Restart `npm run dev` after adding it.

**Vercel** — Project → **Settings → Environment Variables**, add the same two
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), then redeploy.

## 5. Use it
A **Sign in** button appears in the header once the keys are set. Sign in with
Google → your local data seeds the cloud on first login; after that, any device
you sign in on loads the same data. If you have data to restore first, Import
your backup **before** the first sign-in so it uploads to the cloud.

### Notes
- The **anon key is public by design** — safety comes from the row-level
  security policies above, not from hiding the key.
- Cloud sync is "cloud wins on login": signing in adopts the cloud copy, then
  your edits save back. Stay signed in to keep everything in sync.
- Free tier is plenty for personal use.
