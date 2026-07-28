const STATUS_LABELS = {
  operational: { label: "Operational", className: "status-operational" },
  maintenance: { label: "Under Maintenance", className: "status-maintenance" },
  degraded: { label: "Degraded Performance", className: "status-degraded" },
  partial_outage: { label: "Partial Outage", className: "status-partial" },
  major_outage: { label: "Major Outage", className: "status-major" },
  unknown: { label: "Checking…", className: "status-unknown" },
};

const REFRESH_INTERVAL_MS = 30000;
const WEBSITE_URL = "https://lumineproxy.org/";

// This page is hosted on GitHub Pages (developmentkinetix.github.io), a
// different origin from the backend, so it has to call the full Vercel URL
// rather than a relative path. Replace this with your actual Vercel
// deployment URL once you've deployed the api/ folder there.
const API_URL = "https://YOUR-VERCEL-PROJECT.vercel.app/api/status";

// Preferred path: hits the Vercel-hosted /api/status serverless function.
// This runs server-side, so it can read the full response body and tell
// the difference between "online", "under maintenance", and "down".
async function fetchStatusViaApi() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("API route unavailable");
  return res.json();
}

// Fallback for static-only hosts with no serverless functions (e.g. GitHub
// Pages). Browsers can't read cross-origin response bodies without CORS
// headers from the target site, so all this can tell us is "did a request
// go through at all" — it can't detect maintenance mode specifically.
async function fetchStatusViaProbe() {
  try {
    await fetch(WEBSITE_URL, { mode: "no-cors", cache: "no-store" });
    return { status: "operational", checkedAt: new Date().toISOString(), limited: true };
  } catch (err) {
    return { status: "major_outage", checkedAt: new Date().toISOString(), limited: true };
  }
}

async function getStatus() {
  try {
    return await fetchStatusViaApi();
  } catch (err) {
    return await fetchStatusViaProbe();
  }
}

function renderStatus(data) {
  const info = STATUS_LABELS[data.status] || STATUS_LABELS.unknown;

  const banner = document.getElementById("overall-banner");
  const bannerText = document.getElementById("overall-text");
  banner.className = `overall-banner ${info.className}`;
  bannerText.textContent = data.status === "operational" ? "All Systems Operational" : info.label;

  const badge = document.getElementById("component-badge");
  badge.textContent = info.label;
  badge.className = `badge ${info.className}`;

  const lastChecked = document.getElementById("last-checked");
  const time = new Date(data.checkedAt);
  lastChecked.textContent = `Last checked: ${time.toLocaleTimeString()}`;

  const limitedNotice = document.getElementById("limited-notice");
  limitedNotice.style.display = data.limited ? "block" : "none";
}

async function refresh() {
  const data = await getStatus();
  renderStatus(data);
}

document.getElementById("refresh-btn").addEventListener("click", refresh);
refresh();
setInterval(refresh, REFRESH_INTERVAL_MS);
