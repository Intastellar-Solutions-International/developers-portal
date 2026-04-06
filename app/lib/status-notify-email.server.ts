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
  unsubscribeToken: string;
  title: string;
  summary?: string;
  startsAtLabel: string;
  endsAtLabel: string;
  monitorsLine: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const statusUrl = absoluteUrl("/status");
  const unsubUrl = absoluteUrl(
    `/api/status/notify/unsubscribe?token=${encodeURIComponent(opts.unsubscribeToken)}`,
  );
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
  const footerHtml = `<p style="margin:0;"><a href="${escapeHtml(unsubUrl)}" style="color:${TEXT_MUTED};text-decoration:underline;">Unsubscribe from status emails</a></p>`;
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
  unsubscribeToken: string;
  severity: string;
  title: string;
  body: string;
  monitorsLine: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const statusUrl = absoluteUrl("/status");
  const unsubUrl = absoluteUrl(
    `/api/status/notify/unsubscribe?token=${encodeURIComponent(opts.unsubscribeToken)}`,
  );
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
  const footerHtml = `<p style="margin:0;"><a href="${escapeHtml(unsubUrl)}" style="color:${TEXT_MUTED};text-decoration:underline;">Unsubscribe from status emails</a></p>`;
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
