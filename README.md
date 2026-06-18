# Wedding Invitation App

Single-page React wedding invitation with:

- cinematic tap-to-reveal opening
- floating petal background
- music playback toggle
- scratch-to-reveal save-the-date cards
- countdown timer
- gallery, venue, and festivities sections
- password-protected admin dashboard with `localStorage` persistence

## Run Locally

1. Open `/Users/arpankaushal/Documents/boni_projeect` in VS Code.
2. Open a terminal.
3. Install dependencies:

```bash
npm install
```

4. Start the dev server:

```bash
npm run dev
```

5. Open the local URL Vite prints, usually `http://localhost:5173`.

## Admin Access

- Open the invitation normally, then click the hidden `Admin` link in the footer.
- Or go directly to `http://localhost:5173/#/admin`.
- Password: `wedding2026`

## How To Change The Song

You have two options:

### Option 1: From the admin panel

1. Open the admin dashboard.
2. Go to `Music & Opening`.
3. Replace the `Music URL` with a direct audio file URL ending in something like `.mp3`, `.wav`, or `.ogg`.
4. Click `Save`.
5. Refresh and tap the opening screen to start playback.
6. This also works on your Vercel site, but only in that browser because the saved value is stored in `localStorage`.

### Option 2: Change the default song in code

Edit [src/App.jsx](/Users/arpankaushal/Documents/boni_projeect/src/App.jsx:1) and update `defaultData.music.audioUrl`.

Use this option when you want the deployed Vercel site to use a new default song for every visitor.

Recommended deployment flow:

1. Update `defaultData.music.audioUrl` in [src/App.jsx](/Users/arpankaushal/Documents/boni_projeect/src/App.jsx:1).
2. Make sure the link is a public direct audio file URL.
3. Push the change to your Git repository.
4. Let Vercel redeploy the project.

Important:

- admin panel music changes are browser-specific
- code changes update the deployed default music for everyone

## What The Admin Can Change

The dashboard lets you update:

- bride and groom names
- monogram
- parents' names
- shloka and invitation copy
- opening prompt text
- save-the-date text and revealed values
- wedding date and countdown text
- gallery photos and captions
- venue name, address, image, and maps link
- festivities list
- each festivity's name, date label, time, image, quote, dress code, venue, and maps link
- background music URL

All admin changes are saved in browser `localStorage`.

## Deploy To Vercel

### Option 1: Deploy with the Vercel website

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com).
3. Sign in and click `Add New...` → `Project`.
4. Import the GitHub repository.
5. Vercel should detect it as a Vite app automatically.
6. Confirm these settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

7. Click `Deploy`.

After deployment, Vercel gives you a live URL.

### Option 2: Deploy with the Vercel CLI

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. In the project folder, run:

```bash
vercel
```

3. Follow the prompts.
4. For production deployment, run:

```bash
vercel --prod
```

## Production Build

To test the production build locally:

```bash
npm run build
npm run preview
```
