import type { Route } from "./+types/api.status.uptime-badge";
import {
  getStatusHistoryMaxPoints,
  getStoredOverallUptime,
} from "~/lib/status-history.server";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Minimal standalone HTML for <iframe src="…/api/status/uptime/badge"> embeds.
 * Opens full status page in a new tab when clicked.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const statusPageUrl = escapeHtml(new URL("/status", request.url).href);
  const windowMaxRuns = getStatusHistoryMaxPoints();
  const stored = await getStoredOverallUptime(windowMaxRuns);

  let pctClass: "good" | "warn" | "bad" | "muted";
  let mainLine: string;
  let subLine: string;

  if (stored) {
    pctClass =
      stored.percent >= 99.9
        ? "good"
        : stored.percent >= 99
          ? "warn"
          : "bad";
    const pctText =
      stored.percent % 1 === 0
        ? `${stored.percent.toFixed(0)}%`
        : `${stored.percent.toFixed(1)}%`;
    mainLine = escapeHtml(`${pctText} uptime`);
    subLine = escapeHtml(
      `${stored.passedRuns}/${stored.totalRuns} runs all OK · up to ${windowMaxRuns} in view`,
    );
  } else {
    pctClass = "muted";
    mainLine = escapeHtml("Uptime");
    subLine = escapeHtml("Collecting scheduled checks…");
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>${mainLine}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; height: 100%; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 6px;
    background: transparent;
  }
  a.badge {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    max-width: 100%;
    padding: 10px 14px;
    border-radius: 10px;
    text-decoration: none;
    border: 1px solid #e4e4e7;
    background: #fafafa;
    color: #18181b;
    transition: border-color 0.15s, background 0.15s;
  }
  a.badge:hover {
    border-color: #a1a1aa;
    background: #f4f4f5;
  }
  a.badge.good { border-color: #a7f3d0; background: #ecfdf5; }
  a.badge.good:hover { border-color: #6ee7b7; background: #d1fae5; }
  a.badge.warn { border-color: #fde68a; background: #fffbeb; }
  a.badge.warn:hover { border-color: #fcd34d; background: #fef3c7; }
  a.badge.bad { border-color: #fecaca; background: #fef2f2; }
  a.badge.bad:hover { border-color: #fca5a5; background: #fee2e2; }
  a.badge.muted { border-color: #e4e4e7; background: #fafafa; }
  .main { font-size: 15px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2; }
  .sub { font-size: 11px; font-weight: 500; color: #71717a; line-height: 1.35; max-width: 220px; }
  .link { font-size: 11px; font-weight: 600; color: #3f3f46; margin-top: 4px; }
  a.badge.good .main { color: #065f46; }
  a.badge.warn .main { color: #92400e; }
  a.badge.bad .main { color: #991b1b; }
  a.badge.muted .main { color: #52525b; }
  @media (prefers-color-scheme: dark) {
    a.badge {
      border-color: #3f3f46;
      background: #18181b;
      color: #fafafa;
    }
    a.badge:hover { border-color: #52525b; background: #27272a; }
    a.badge.good { border-color: #047857; background: #022c22; }
    a.badge.good:hover { border-color: #059669; background: #064e3b; }
    a.badge.warn { border-color: #b45309; background: #451a03; }
    a.badge.warn:hover { border-color: #d97706; background: #78350f; }
    a.badge.bad { border-color: #b91c1c; background: #450a0a; }
    a.badge.bad:hover { border-color: #dc2626; background: #7f1d1d; }
    a.badge.muted { border-color: #3f3f46; background: #18181b; }
    .sub { color: #a1a1aa; }
    .link { color: #d4d4d8; }
    a.badge.good .main { color: #6ee7b7; }
    a.badge.warn .main { color: #fcd34d; }
    a.badge.bad .main { color: #fca5a5; }
    a.badge.muted .main { color: #d4d4d8; }
  }
</style>
</head>
<body>
  <a class="badge ${pctClass}" href="${statusPageUrl}" target="_blank" rel="noopener noreferrer">
    <span class="main">${mainLine}</span>
    <span class="sub">${subLine}</span>
    <span class="link">System status →</span>
  </a>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "X-Robots-Tag": "noindex",
    },
  });
}
