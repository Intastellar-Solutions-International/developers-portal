import type { Route } from "./+types/api.status.uptime-badge";
import { BRAND } from "~/lib/brand";
import { localeToHtmlLang } from "~/lib/i18n/locale";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { interpolate, translatePath } from "~/lib/i18n/messages";
import { resolveLocaleForApiRequest } from "~/lib/i18n/resolve-locale.server";
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

/** `theme` query: force light/dark UI; omit or `auto` follows the visitor OS. */
function parseBadgeTheme(request: Request): "light" | "dark" | "auto" {
  const v = new URL(request.url).searchParams.get("theme");
  if (v === "light" || v === "dark") return v;
  return "auto";
}

/**
 * Dark palette + white Consents logo (duplicated for auto-OS-dark vs forced dark).
 * Keep in sync when editing badge colors.
 */
const BADGE_DARK_CSS = `
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
  a.powered { color: #a1a1aa; }
  a.powered:hover { color: #e4e4e7; }
  .logo-onlight { display: none !important; }
  .logo-ondark { display: block !important; }
`;

/**
 * Minimal standalone HTML for <iframe src="…/api/status/uptime/badge"> embeds.
 * Opens full status page in a new tab when clicked.
 *
 * Language: `?locale=de|da|fr|nl|pt-br|en` or `Accept-Language` (`pt` maps to Brazilian); defaults to English.
 * Theme: `?theme=light` | `?theme=dark` | omit / `?theme=auto` — follow `prefers-color-scheme`.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const locale = resolveLocaleForApiRequest(request);
  const theme = parseBadgeTheme(request);
  const statusPath = withLocalePrefix("/status", locale);
  const statusPageUrl = escapeHtml(new URL(statusPath, request.url).href);
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
    mainLine = escapeHtml(
      interpolate(translatePath(locale, "status.badgeMainUptime"), {
        percent: pctText,
      }),
    );
    subLine = escapeHtml(
      interpolate(translatePath(locale, "status.badgeSubOk"), {
        passedRuns: stored.passedRuns,
        totalRuns: stored.totalRuns,
        windowMaxRuns,
      }),
    );
  } else {
    pctClass = "muted";
    mainLine = escapeHtml(translatePath(locale, "status.badgePlaceholder"));
    subLine = escapeHtml(translatePath(locale, "status.badgeCollecting"));
  }

  const linkText = escapeHtml(translatePath(locale, "status.badgeLink"));
  const logoAlt = escapeHtml(translatePath(locale, "status.badgeLogoAlt"));
  const poweredByText = escapeHtml(translatePath(locale, "status.badgePoweredBy"));
  const homeUrl = escapeHtml(new URL("/", request.url).href);
  const logoBlack = escapeHtml(BRAND.consentsLogo.black);
  const logoWhite = escapeHtml(BRAND.consentsLogo.white);
  const htmlLang = localeToHtmlLang(locale);
  const themeAttr =
    theme === "auto" ? "" : ` data-theme="${theme}"`;

  const html = `<!DOCTYPE html>
<html lang="${htmlLang}"${themeAttr}>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex"/>
<meta name="color-scheme" content="light dark"/>
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
  .wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    max-width: 100%;
  }
  .brand-row {
    display: flex;
    align-items: center;
    height: 22px;
    padding: 0 2px;
  }
  .brand-row img {
    height: 22px;
    width: auto;
    max-width: 168px;
    object-fit: contain;
    object-position: left center;
  }
  .logo-onlight { display: block; }
  .logo-ondark { display: none; }
  a.badge {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    max-width: 100%;
    width: 100%;
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
  a.powered {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #71717a;
    text-decoration: none;
    padding: 0 2px 2px;
    align-self: flex-start;
  }
  a.powered:hover { color: #3f3f46; text-decoration: underline; }
  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) {
${BADGE_DARK_CSS}
    }
  }
  html[data-theme="dark"] {
${BADGE_DARK_CSS}
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="brand-row" role="group" aria-label="${logoAlt}">
      <img class="logo-onlight" src="${logoBlack}" alt="" width="140" height="22" decoding="async" aria-hidden="true" />
      <img class="logo-ondark" src="${logoWhite}" alt="" width="140" height="22" decoding="async" aria-hidden="true" />
    </div>
    <a class="badge ${pctClass}" href="${statusPageUrl}" target="_blank" rel="noopener noreferrer">
      <span class="main">${mainLine}</span>
      <span class="sub">${subLine}</span>
      <span class="link">${linkText}</span>
    </a>
    <a class="powered" href="${homeUrl}" target="_blank" rel="noopener noreferrer">${poweredByText}</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "X-Robots-Tag": "noindex",
      Vary: "Accept-Language",
    },
  });
}
