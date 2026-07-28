// Vercel serverless function — runs server-side, so it can read the full
// page body (no browser CORS limitations) to accurately tell "online" apart
// from "under maintenance" apart from "down".
//
// This only exists when hosted on Vercel. On GitHub Pages (static-only,
// no server functions) the frontend automatically falls back to a more
// limited, browser-only reachability check — see script.js.

const TARGET_URL = "https://lumineproxy.org/";
const MAINTENANCE_TEXT = "Lumine is down for maintenance. Check the Discord for updates. https://discord.gg/lumine-utility-proxy-1424798387664064687";
const TIMEOUT_MS = 8000;

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(TARGET_URL, { signal: controller.signal });
    clearTimeout(timeout);

    const body = await response.text();
    const isMaintenance = body.includes(MAINTENANCE_TEXT);
    const isOk = response.status >= 200 && response.status < 300;

    let status;
    if (!isOk) status = "major_outage";
    else if (isMaintenance) status = "maintenance";
    else status = "operational";

    res.status(200).json({
      status,
      checkedAt: new Date().toISOString(),
      httpStatus: response.status,
    });
  } catch (err) {
    clearTimeout(timeout);
    res.status(200).json({
      status: "major_outage",
      checkedAt: new Date().toISOString(),
      error: err.message,
    });
  }
};
