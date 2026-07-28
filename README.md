# Lumine Status

A public status page for the Lumine website — no players tracker, just
website up/down/maintenance status, styled like a typical status page
(overall banner + component card).

**Frontend:** https://developmentkinetix.github.io/Lumine-Status-Proxy/ (GitHub Pages)
**Backend:** a small serverless function, deployed separately on Vercel

## Why two hosts?

GitHub Pages only serves static files — it can't run server-side code. The
accurate maintenance-mode check needs to read the actual page content of
`lumineproxy.org`, and browsers can't do that across origins unless the
target site sends CORS headers (it doesn't). So the backend check
(`api/status.js`) has to run somewhere that supports server functions —
Vercel — and the GitHub Pages frontend calls it over the network.

## Setup

### 1. Deploy the backend to Vercel

1. Push this whole folder to a GitHub repo (can be the same repo Pages
   serves from, or a separate one — doesn't matter).
2. In Vercel, **Add New Project** → import that repo → framework preset
   **Other** (no build step needed) → Deploy.
3. Vercel will give you a URL like `https://your-project.vercel.app`.
   Confirm `https://your-project.vercel.app/api/status` returns JSON.

### 2. Point the frontend at it

Open `script.js` and replace the placeholder:

```js
const API_URL = "https://YOUR-VERCEL-PROJECT.vercel.app/api/status";
```

with your actual Vercel URL from step 1, then push that change.

### 3. Serve the frontend on GitHub Pages

1. Repo **Settings → Pages** → set source to the branch/folder this lives in.
2. It'll be live at `https://developmentkinetix.github.io/Lumine-Status-Proxy/`.

CORS is already configured in `api/status.js` to only allow requests from
that exact GitHub Pages origin — if you ever change the Pages URL (new repo
name, custom domain, etc.), update `ALLOWED_ORIGIN` in `api/status.js` to
match, or the browser will block the request.

## If the Vercel backend is ever down or not yet set up

`script.js` automatically falls back to a basic browser-side reachability
check if the API call fails. That fallback can only show **Operational** or
**Major Outage** — not maintenance mode — since it can't read the target
site's response body. A small "limited mode" notice appears on the page
automatically whenever this fallback is in use.

## Customizing

- Change the monitored URL: edit `WEBSITE_URL` in `script.js` and
  `TARGET_URL` in `api/status.js` (keep them in sync).
- Change the maintenance-mode detection text: edit `MAINTENANCE_TEXT` in
  `api/status.js` to match whatever your site actually shows during
  maintenance.
- Add more component cards: duplicate the `<div class="card">...</div>`
  block in `index.html` and extend `api/status.js` to check more than one
  URL.
