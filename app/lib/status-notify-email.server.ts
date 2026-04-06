import { BRAND } from "~/lib/brand";
import { absoluteUrl } from "~/lib/site";

/** Matches `app/app.css` brand tokens for on-brand buttons/links in clients that support it. */
const BRAND_GOLD = "#c09f53";
const TEXT_DARK = "#171717";
const TEXT_BODY = "#3f3f46";
const TEXT_MUTED = "#71717a";
const BORDER = "#e4e4e7";
const PAGE_BG = "#f4f4f5";
const CARD_BG = "#ffffff";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const OPS_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Extra recipients for maintenance, incident, and probe-failure alerts (comma-separated in env).
 * Not part of Mongo subscriptions; emails omit the unsubscribe link for these addresses.
 */
export function getOpsNotificationEmails(): string[] {
  const raw = process.env.STATUS_NOTIFY_OPS_EMAILS?.trim();
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const e = part.trim().toLowerCase();
    if (!e || !OPS_EMAIL_RE.test(e) || seen.has(e)) continue;
    seen.add(e);
    out.push(e);
  }
  return out;
}

function unsubscribeFooterParagraph(unsubscribeToken: string): string {
  const unsubUrl = absoluteUrl(
    `/api/status/notify/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`,
  );
  return `<p style="margin:0;"><a href="${escapeHtml(unsubUrl)}" style="color:${TEXT_MUTED};text-decoration:underline;">Unsubscribe from status emails</a></p>`;
}

function opsRecipientFooterParagraph(): string {
  return `<p style="margin:0;color:${TEXT_MUTED};font-size:12px;line-height:1.55;">This address is listed in <code style="background:#f4f4f5;padding:2px 6px;border-radius:4px;font-size:11px;">STATUS_NOTIFY_OPS_EMAILS</code> on the server (not the public subscribe list).</p>`;
}

function alertFooterHtml(unsubscribeToken: string | null): string {
  return unsubscribeToken
    ? unsubscribeFooterParagraph(unsubscribeToken)
    : opsRecipientFooterParagraph();
}

function statusEmailLogoSrc(): string {
  const fromEnv = process.env.STATUS_NOTIFY_EMAIL_LOGO_URL?.trim();
  if (fromEnv && /^https:\/\//i.test(fromEnv)) {
    return fromEnv;
  }
  return BRAND.developersLogoBlack;
}

/**
 * Table-based layout + inline styles for broad client support (Gmail, Outlook, Apple Mail).
 */
function wrapStatusEmailLayout(opts: {
  /** Hidden preview line in inbox lists */
  preheader: string;
  /** Main body HTML (already safe / escaped where needed) */
  bodyHtml: string;
  /** Small print below the main card (unsubscribe, legal) */
  footerHtml: string;
}): string {
  const logoSrc = escapeHtml(statusEmailLogoSrc());
  const siteUrl = escapeHtml(absoluteUrl("/"));
  const statusUrl = escapeHtml(absoluteUrl("/status"));
  const pre = escapeHtml(opts.preheader);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>inta.dev</title>
</head>
<body style="margin:0;padding:0;background:${PAGE_BG};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${pre}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${PAGE_BG};">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${CARD_BG};border-radius:12px;border:1px solid ${BORDER};box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:22px 28px 18px;border-bottom:1px solid ${BORDER};">
              <a href="${siteUrl}" style="text-decoration:none;display:inline-block;">
                <img src="${logoSrc}" width="200" height="40" alt="inta.dev developers" style="display:block;max-width:200px;height:auto;border:0;outline:none;" />
              </a>
              <p style="margin:10px 0 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.02em;color:${BRAND_GOLD};">
                System status
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:${TEXT_BODY};">
              ${opts.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;line-height:1.55;color:${TEXT_MUTED};border-top:1px solid ${BORDER};">
              ${opts.footerHtml}
              <p style="margin:14px 0 0;padding-top:14px;border-top:1px solid ${BORDER};">
                <a href="${statusUrl}" style="color:${BRAND_GOLD};text-decoration:underline;">Status page</a>
                <span style="color:${BORDER};">&nbsp;·&nbsp;</span>
                <a href="${siteUrl}" style="color:${TEXT_MUTED};text-decoration:underline;">inta.dev</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;color:${TEXT_MUTED};text-align:center;max-width:560px;">
          Intastellar Solutions
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  const h = escapeHtml(href);
  const l = escapeHtml(label);
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px 0;">
  <tr>
    <td style="border-radius:8px;background:${TEXT_DARK};">
      <a href="${h}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
        ${l}
      </a>
    </td>
  </tr>
</table>`;
}

export function isStatusEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.STATUS_NOTIFY_FROM?.trim(),
  );
}

async function sendResendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.STATUS_NOTIFY_FROM?.trim();
  if (!key || !from) {
    return { ok: false, error: "Email is not configured." };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.warn("[status-notify] Resend error:", res.status, text);
    return { ok: false, error: "Could not send email." };
  }
  return { ok: true };
}

export async function sendStatusVerifyEmail(
  to: string,
  verifyToken: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const verifyUrl = absoluteUrl(
    `/api/status/notify/verify?token=${encodeURIComponent(verifyToken)}`,
  );
  const subject = "Confirm your inta.dev status updates subscription";
  const bodyHtml = `
<p style="margin:0 0 16px;font-size:16px;font-weight:600;color:${TEXT_DARK};">Confirm your subscription</p>
<p style="margin:0 0 8px;">You’re almost done — confirm your email to receive <strong>maintenance</strong> and/or <strong>operator notice</strong> updates from inta.dev.</p>
${ctaButton(verifyUrl, "Confirm subscription")}
<p style="margin:20px 0 0;font-size:13px;color:${TEXT_MUTED};">Or paste this link into your browser:</p>
<p style="margin:6px 0 0;font-size:12px;word-break:break-all;color:${BRAND_GOLD};">${escapeHtml(verifyUrl)}</p>
`;
  const footerHtml = `<p style="margin:0;">If you didn’t request this, you can ignore this message.</p>`;
  const html = wrapStatusEmailLayout({
    preheader: "Confirm your inta.dev status email subscription.",
    bodyHtml,
    footerHtml,
  });
  return sendResendEmail({ to, subject, html });
}

export async function sendMaintenanceAlertEmail(opts: {
  to: string;
  /** `null` = ops routing via STATUS_NOTIFY_OPS_EMAILS (no unsubscribe link). */
  unsubscribeToken: string | null;
  title: string;
  summary?: string;
  startsAtLabel: string;
  endsAtLabel: string;
  monitorsLine: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const statusUrl = absoluteUrl("/status");
  const subject = `Scheduled maintenance: ${opts.title}`;
  const metaRows = [
    `<tr><td style="padding:6px 0;font-size:13px;color:${TEXT_MUTED};width:88px;vertical-align:top;">When</td><td style="padding:6px 0;font-size:14px;color:${TEXT_DARK};font-weight:500;">${escapeHtml(opts.startsAtLabel)} → ${escapeHtml(opts.endsAtLabel)}</td></tr>`,
  ];
  if (opts.summary) {
    metaRows.push(
      `<tr><td style="padding:6px 0;font-size:13px;color:${TEXT_MUTED};vertical-align:top;">Summary</td><td style="padding:6px 0;font-size:14px;color:${TEXT_BODY};">${escapeHtml(opts.summary)}</td></tr>`,
    );
  }
  if (opts.monitorsLine) {
    metaRows.push(
      `<tr><td style="padding:6px 0;font-size:13px;color:${TEXT_MUTED};vertical-align:top;">Monitors</td><td style="padding:6px 0;font-size:14px;color:${TEXT_BODY};">${escapeHtml(opts.monitorsLine)}</td></tr>`,
    );
  }
  const bodyHtml = `
<p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND_GOLD};">Scheduled maintenance</p>
<p style="margin:0 0 18px;font-size:18px;font-weight:600;color:${TEXT_DARK};line-height:1.3;">${escapeHtml(opts.title)}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#fafafa;border-radius:8px;border:1px solid ${BORDER};">
  <tr><td style="padding:14px 18px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${metaRows.join("")}</table>
  </td></tr>
</table>
${ctaButton(statusUrl, "View status page")}
`;
  const footerHtml = alertFooterHtml(opts.unsubscribeToken);
  const html = wrapStatusEmailLayout({
    preheader: `Maintenance: ${opts.title}`,
    bodyHtml,
    footerHtml,
  });
  return sendResendEmail({
    to: opts.to,
    subject,
    html,
  });
}

export async function sendIncidentAlertEmail(opts: {
  to: string;
  unsubscribeToken: string | null;
  severity: string;
  title: string;
  body: string;
  monitorsLine: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const statusUrl = absoluteUrl("/status");
  const subject = `Status notice: ${opts.title}`;
  const bodyShort =
    opts.body.length > 4000 ? `${opts.body.slice(0, 4000)}…` : opts.body;
  const sev = escapeHtml(opts.severity);
  const monitorsBlock = opts.monitorsLine
    ? `<p style="margin:14px 0 0;font-size:13px;color:${TEXT_MUTED};"><strong style="color:${TEXT_DARK};">Monitors:</strong> ${escapeHtml(opts.monitorsLine)}</p>`
    : "";
  const bodyHtml = `
<p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND_GOLD};">Operator notice</p>
<p style="margin:0 0 6px;"><span style="display:inline-block;padding:3px 10px;border-radius:999px;background:#fef3c7;color:#92400e;font-size:12px;font-weight:600;">${sev}</span></p>
<p style="margin:0 0 16px;font-size:18px;font-weight:600;color:${TEXT_DARK};line-height:1.3;">${escapeHtml(opts.title)}</p>
<div style="margin:0 0 20px;padding:16px 18px;background:#fafafa;border-radius:8px;border:1px solid ${BORDER};font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;font-size:13px;line-height:1.55;color:${TEXT_BODY};white-space:pre-wrap;">${escapeHtml(bodyShort)}</div>
${monitorsBlock}
${ctaButton(statusUrl, "View status page")}
`;
  const footerHtml = alertFooterHtml(opts.unsubscribeToken);
  const html = wrapStatusEmailLayout({
    preheader: `${opts.severity}: ${opts.title}`,
    bodyHtml,
    footerHtml,
  });
  return sendResendEmail({
    to: opts.to,
    subject,
    html,
  });
}

export async function sendIncidentUpdateAlertEmail(opts: {
  to: string;
  unsubscribeToken: string | null;
  title: string;
  body: string;
  fromSeverity: string;
  toSeverity: string;
  updateMessage: string;
  monitorsLine: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const statusUrl = absoluteUrl("/status");
  const subject = `Status update: ${opts.title}`.slice(0, 200);
  const bodyShort =
    opts.body.length > 2500 ? `${opts.body.slice(0, 2500)}…` : opts.body;
  const sevTo = escapeHtml(opts.toSeverity);
  const monitorsBlock = opts.monitorsLine
    ? `<p style="margin:14px 0 0;font-size:13px;color:${TEXT_MUTED};"><strong style="color:${TEXT_DARK};">Monitors:</strong> ${escapeHtml(opts.monitorsLine)}</p>`
    : "";
  const statusChangeBlock =
    opts.fromSeverity !== opts.toSeverity
      ? `<p style="margin:0 0 16px;font-size:14px;color:${TEXT_BODY};">Status changed from <strong>${escapeHtml(opts.fromSeverity)}</strong> to <strong>${escapeHtml(opts.toSeverity)}</strong>.</p>`
      : "";
  const messageBlock = opts.updateMessage.trim()
    ? `<div style="margin:0 0 20px;padding:16px 18px;background:#fafafa;border-radius:8px;border:1px solid ${BORDER};font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;font-size:13px;line-height:1.55;color:${TEXT_BODY};white-space:pre-wrap;">${escapeHtml(
        opts.updateMessage.length > 4000
          ? `${opts.updateMessage.slice(0, 4000)}…`
          : opts.updateMessage,
      )}</div>`
    : "";
  const contextBlock = `<p style="margin:0 0 8px;font-size:12px;font-weight:600;color:${TEXT_MUTED};letter-spacing:0.02em;">Original notice (excerpt)</p>
<div style="margin:0 0 20px;padding:14px 16px;background:#fafafa;border-radius:8px;border:1px solid ${BORDER};font-size:13px;line-height:1.55;color:${TEXT_MUTED};white-space:pre-wrap;">${escapeHtml(bodyShort)}</div>`;
  const bodyHtml = `
<p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND_GOLD};">Operator notice — update</p>
<p style="margin:0 0 6px;"><span style="display:inline-block;padding:3px 10px;border-radius:999px;background:#fef3c7;color:#92400e;font-size:12px;font-weight:600;">${sevTo}</span></p>
<p style="margin:0 0 16px;font-size:18px;font-weight:600;color:${TEXT_DARK};line-height:1.3;">${escapeHtml(opts.title)}</p>
${statusChangeBlock}
${messageBlock}
${contextBlock}
${monitorsBlock}
${ctaButton(statusUrl, "View status page")}
`;
  const pre =
    opts.updateMessage.trim().slice(0, 140) ||
    (opts.fromSeverity !== opts.toSeverity
      ? `${opts.fromSeverity} → ${opts.toSeverity}`
      : "Operator notice updated");
  const footerHtml = alertFooterHtml(opts.unsubscribeToken);
  const html = wrapStatusEmailLayout({
    preheader: pre,
    bodyHtml,
    footerHtml,
  });
  return sendResendEmail({
    to: opts.to,
    subject,
    html,
  });
}

export async function sendProbeFailureAlertEmail(opts: {
  to: string;
  unsubscribeToken: string | null;
  checkedAtLabel: string;
  failures: Array<{
    name: string;
    url: string;
    statusCode: number | null;
    error: string | null;
    latencyMs: number;
  }>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const statusUrl = absoluteUrl("/status");
  const n = opts.failures.length;
  const subject =
    n === 1
      ? `Automated check failed: ${opts.failures[0].name}`.slice(0, 180)
      : `Automated checks failed (${n} monitors)`;
  const detailRows = opts.failures
    .map((f) => {
      const code =
        f.statusCode != null ? `HTTP ${f.statusCode}` : "No response";
      const err = f.error?.trim() ? f.error : code;
      return `<tr>
  <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};vertical-align:top;">
    <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:${TEXT_DARK};">${escapeHtml(f.name)}</p>
    <p style="margin:0 0 8px;font-size:12px;word-break:break-all;color:${TEXT_MUTED};">${escapeHtml(f.url)}</p>
    <p style="margin:0;font-size:13px;color:#b91c1c;font-weight:500;">${escapeHtml(err)}</p>
    <p style="margin:6px 0 0;font-size:12px;color:${TEXT_MUTED};">${escapeHtml(code)} · ${f.latencyMs} ms</p>
  </td>
</tr>`;
    })
    .join("");
  const bodyHtml = `
<p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#b45309;">Automated monitoring</p>
<p style="margin:0 0 8px;font-size:16px;font-weight:600;color:${TEXT_DARK};">One or more checks just started failing</p>
<p style="margin:0 0 18px;font-size:14px;color:${TEXT_BODY};">Checked at <strong>${escapeHtml(opts.checkedAtLabel)}</strong> (UTC). This email is sent when a monitor moves from passing to failing so you are not notified on every cron run while it stays down.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca;overflow:hidden;">
  ${detailRows}
</table>
${ctaButton(statusUrl, "View status page")}
`;
  const footerHtml = opts.unsubscribeToken
    ? `<p style="margin:0;">You receive this because you subscribed to <strong>operator notices</strong> on the status page (that list includes automated check alerts).</p>
<p style="margin:12px 0 0;"><a href="${escapeHtml(absoluteUrl(`/api/status/notify/unsubscribe?token=${encodeURIComponent(opts.unsubscribeToken)}`))}" style="color:${TEXT_MUTED};text-decoration:underline;">Unsubscribe from status emails</a></p>`
    : opsRecipientFooterParagraph();
  const pre =
    n === 1
      ? `Check failed: ${opts.failures[0].name}`
      : `${n} monitors failing`;
  const html = wrapStatusEmailLayout({
    preheader: pre,
    bodyHtml,
    footerHtml,
  });
  return sendResendEmail({
    to: opts.to,
    subject,
    html,
  });
}
