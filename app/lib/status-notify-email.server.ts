import { absoluteUrl } from "~/lib/site";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  const html = `<p>Confirm your email to receive status updates (maintenance and/or operator notices) from inta.dev.</p>
<p><a href="${verifyUrl}">Confirm subscription</a></p>
<p style="color:#666;font-size:12px">If you did not request this, you can ignore this message.</p>`;
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
  const parts = [
    `<p><strong>${escapeHtml(opts.title)}</strong></p>`,
    `<p>${escapeHtml(opts.startsAtLabel)} → ${escapeHtml(opts.endsAtLabel)}</p>`,
  ];
  if (opts.summary) {
    parts.push(`<p>${escapeHtml(opts.summary)}</p>`);
  }
  if (opts.monitorsLine) {
    parts.push(`<p>${escapeHtml(opts.monitorsLine)}</p>`);
  }
  parts.push(
    `<p><a href="${statusUrl}">Open status page</a></p>`,
    `<p style="color:#666;font-size:12px"><a href="${unsubUrl}">Unsubscribe</a></p>`,
  );
  return sendResendEmail({
    to: opts.to,
    subject,
    html: parts.join("\n"),
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
  const parts = [
    `<p><strong>[${escapeHtml(opts.severity)}] ${escapeHtml(opts.title)}</strong></p>`,
    `<pre style="white-space:pre-wrap;font-family:system-ui,sans-serif">${escapeHtml(bodyShort)}</pre>`,
  ];
  if (opts.monitorsLine) {
    parts.push(`<p>${escapeHtml(opts.monitorsLine)}</p>`);
  }
  parts.push(
    `<p><a href="${statusUrl}">Open status page</a></p>`,
    `<p style="color:#666;font-size:12px"><a href="${unsubUrl}">Unsubscribe</a></p>`,
  );
  return sendResendEmail({
    to: opts.to,
    subject,
    html: parts.join("\n"),
  });
}
