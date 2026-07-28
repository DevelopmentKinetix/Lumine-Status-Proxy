// Vercel serverless function — runs server-side, so it can read the full
// page body (no browser CORS limitations) to accurately tell "online" apart
// from "under maintenance" apart from "down".
//
// The frontend for this lives on GitHub Pages at a different origin
// (https://developmentkinetix.github.io), so this needs CORS headers to
// allow that origin to call it cross-origin.

const TARGET_URL = "https://lumineproxy.org/";
const MAINTENANCE_TEXT = "Lumine is down for maintenance. Check the Discord for updates.";
const TIMEOUT_MS = 8000;

// Only this origin is allowed to call the API cross-origin.
const ALLOWED_ORIGIN = "https://developmentkinetix.github.io";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store");

  // Browsers send a preflight OPTIONS request before some cross-origin
  // GETs; respond to it so the real GET isn't blocked.
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

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
