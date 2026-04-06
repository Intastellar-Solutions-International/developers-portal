import { useEffect, useId, useState } from "react";

import { useI18n } from "~/providers/i18n-provider";

function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function StatusUptimeBadgeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const titleId = useId();
  const descId = useId();
  const [copied, setCopied] = useState<"iframe" | "json" | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const tmr = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(tmr);
  }, [copied]);

  if (!open) return null;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const badgeUrl = `${origin}/api/status/uptime/badge?locale=${locale}`;
  const jsonUrl = `${origin}/api/status/uptime?locale=${locale}`;
  const iframeTitleEscaped = escapeHtmlAttr(t("status.embedIframeTitle"));
  const iframeSnippet =
    origin.length > 0
      ? `<iframe
  src="${badgeUrl}"
  title="${iframeTitleEscaped}"
  width="280"
  height="112"
  style="border:0;border-radius:10px;max-width:100%"
  loading="lazy"
></iframe>`
      : "";

  async function copyText(text: string, key: "iframe" | "json") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/50 px-4 pt-[min(10vh,5rem)] pb-8"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="max-h-[min(85vh,720px)] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2
            id={titleId}
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {t("status.embedModalTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            {t("status.embedModalClose")}
          </button>
        </div>
        <p
          id={descId}
          className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
        >
          {t("status.embedModalIntro")}
        </p>

        <section className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("status.embedIframeHeading")}
            </h3>
            <button
              type="button"
              disabled={!iframeSnippet}
              onClick={() => copyText(iframeSnippet, "iframe")}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {copied === "iframe"
                ? t("status.embedCopied")
                : t("status.embedCopy")}
            </button>
          </div>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[0.7rem] leading-relaxed text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
            <code>
              {iframeSnippet || t("status.embedOpenOnSite")}
            </code>
          </pre>
        </section>

        <section className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("status.embedJsonHeading")}
            </h3>
            <button
              type="button"
              disabled={origin.length === 0}
              onClick={() => copyText(jsonUrl, "json")}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {copied === "json"
                ? t("status.embedCopied")
                : t("status.embedCopy")}
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t("status.embedJsonHint")}
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[0.7rem] leading-relaxed text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
            <code>{origin ? jsonUrl : t("status.embedOpenOnSite")}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}
