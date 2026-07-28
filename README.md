# Lumine Status

A simple public status page for the Lumine website — no players tracker, just
website up/down/maintenance status, styled like a typical status page
(overall banner + component cards).

## Files

- `index.html` / `style.css` / `script.js` — the page itself (plain HTML/CSS/JS, no build step, no framework).
- `api/status.js` — a Vercel serverless function that checks `https://lumineproxy.org/` server-side.
- `favicon.png` — your Lumine logo, used as the site favicon.

## Hosting on Vercel (recommended — full accuracy)

1. Push this folder to a GitHub repo.
2. In Vercel, **Add New Project** → import that repo.
3. Framework preset: choose **Other** (no build step needed).
4. Deploy. Vercel automatically turns `api/status.js` into a live serverless
   endpoint at `/api/status`, so the page gets real server-side checks —
   it can tell "online" apart from "under maintenance" apart from "down".

## Hosting on GitHub Pages (works too — limited accuracy)

GitHub Pages only serves static files; it can't run `api/status.js`. So on
GitHub Pages, `script.js` automatically falls back to a basic browser-side
reachability check instead:

1. Push this folder to a GitHub repo.
2. Repo **Settings → Pages** → set source to the branch/folder this lives in.
3. Done — it'll serve `index.html` directly.

The tradeoff: a browser can't read the actual page content of a different
site unless that site sends CORS headers allowing it (lumineproxy.org
doesn't), so on GitHub Pages the badge can only show **Operational** or
**Major Outage** based on whether a request went through at all — it can't
detect maintenance mode specifically. A small "limited mode" note appears
on the page automatically when this fallback is in use.

If you want full accuracy on GitHub Pages too, the fix would be adding
CORS headers (e.g. `Access-Control-Allow-Origin: *`) to the Lumine website's
own server response, so the browser is allowed to read it directly.

## Customizing

- Change the monitored URL: edit `WEBSITE_URL` in `script.js` and
  `TARGET_URL` in `api/status.js` (keep them in sync).
- Change the maintenance-mode detection text: edit `MAINTENANCE_TEXT` in
  `api/status.js` to match whatever your site actually shows during
  maintenance.
- Add more component cards: duplicate the `<div class="card">...</div>`
  block in `index.html` and extend `api/status.js` to check more than one
  URL.
