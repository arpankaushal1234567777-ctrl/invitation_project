# Wedding Invitation App

Single-page React wedding invitation with:

- cinematic tap-to-reveal opening
- floating petal background
- reveal-on-scroll sections
- scratch-to-reveal save-the-date cards
- countdown timer
- admin dashboard for invitation content
- Supabase-backed global music upload and playback config

## What I Changed In Code

The code now supports:

- one global music record shared by all visitors
- admin upload of a replacement MP3
- one fixed storage path so only one song is active at a time
- section-based music trigger selection
- clip start and clip duration controls
- Supabase load on app start
- Supabase save on admin `Save`

Files added or updated:

- [src/App.jsx](/Users/arpankaushal/Documents/boni_projeect/src/App.jsx:1)
- [src/supabase.js](/Users/arpankaushal/Documents/boni_projeect/src/supabase.js:1)
- [.env.example](/Users/arpankaushal/Documents/boni_projeect/.env.example:1)
- [package.json](/Users/arpankaushal/Documents/boni_projeect/package.json:1)

## Human Tasks Required

These are the setup steps a human must do. I handled the coding, but these platform tasks must be performed in your Supabase and Vercel accounts.

### 1. Create a Supabase project

1. Go to [Supabase](https://supabase.com/).
2. Create a new project.
3. Wait for the database to finish provisioning.

### 2. Create the storage bucket

1. Open your Supabase project.
2. Go to `Storage`.
3. Create a new bucket named:

```text
wedding-media
```

4. Make the bucket `Public`.

This app uploads the shared music file to:

```text
music/current.mp3
```

### 3. Create the database table

1. Go to `SQL Editor` in Supabase.
2. Run this SQL:

```sql
create table if not exists public.site_music (
  id text primary key,
  audio_url text not null,
  file_name text,
  start_section text not null default 'opening',
  clip_start_seconds integer not null default 0,
  clip_length_seconds integer not null default 30,
  source_type text not null default 'url',
  updated_at timestamptz not null default now()
);
```

3. Insert the one global row:

```sql
insert into public.site_music (
  id,
  audio_url,
  file_name,
  start_section,
  clip_start_seconds,
  clip_length_seconds,
  source_type
)
values (
  'global',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'default',
  'opening',
  0,
  30,
  'url'
)
on conflict (id) do nothing;
```

### 4. Add storage policies

You need policies that allow the frontend app to read and replace the single shared MP3.

Run this in Supabase SQL Editor:

```sql
create policy "Public can read wedding music"
on storage.objects
for select
to public
using (bucket_id = 'wedding-media');

create policy "Public can upload wedding music"
on storage.objects
for insert
to public
with check (bucket_id = 'wedding-media');

create policy "Public can update wedding music"
on storage.objects
for update
to public
using (bucket_id = 'wedding-media')
with check (bucket_id = 'wedding-media');
```

### 5. Add table policies

If Row Level Security is enabled, add policies for the `site_music` table too.

Run:

```sql
alter table public.site_music enable row level security;

create policy "Public can read site music"
on public.site_music
for select
to public
using (true);

create policy "Public can insert site music"
on public.site_music
for insert
to public
with check (true);

create policy "Public can update site music"
on public.site_music
for update
to public
using (true)
with check (true);
```

Important:

- this is the fastest setup for a personal/admin-controlled invitation
- it is not secure against malicious public writes because the app is frontend-only
- for stronger security, the next step would be moving uploads to a server/API route with admin auth

### 6. Get Supabase project credentials

1. In Supabase, go to `Project Settings` → `API`.
2. Copy:
   - `Project URL`
   - `anon public key`

### 7. Create local environment file

Create a `.env` file in the project root using [.env.example](/Users/arpankaushal/Documents/boni_projeect/.env.example:1):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 8. Add the same env vars to Vercel

1. Open your Vercel project.
2. Go to `Settings` → `Environment Variables`.
3. Add:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

4. Redeploy the project.

## Run Locally

1. Open `/Users/arpankaushal/Documents/boni_projeect` in VS Code.
2. Install dependencies:

```bash
npm install
```

3. Start the app:

```bash
npm run dev
```

4. Open the Vite URL, usually:

```text
http://localhost:5173
```

## Admin Access

- open the invitation and click the hidden `Admin` link in the footer
- or visit `#/admin`
- password: `wedding2026`

## How Global Music Works Now

### If you use a direct music URL

1. Open `Admin`.
2. Go to `Music & Opening`.
3. Paste the public MP3 URL.
4. Choose:
   - section to begin playback
   - clip start in seconds
   - clip length in seconds
5. Click `Save`.

That updates the shared Supabase row for everyone.

### If you upload an MP3 file

1. Open `Admin`.
2. Go to `Music & Opening`.
3. Choose the MP3 from your device.
4. Adjust section, clip start, and clip length.
5. Click `Save`.

That uploads the MP3 to Supabase Storage at the one shared path:

```text
music/current.mp3
```

So only one music file is active at a time.

## Vercel Deployment

1. Push the project to GitHub.
2. Import the repo into Vercel.
3. Add the two Supabase env vars in Vercel.
4. Deploy.
5. Test the admin music upload on the deployed site.

## Build Check

To verify production build locally:

```bash
npm run build
```
