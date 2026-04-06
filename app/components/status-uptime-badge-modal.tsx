import { useEffect, useId, useState } from "react";

import type { StatusPageCopy } from "~/lib/status-page-copy";
import type { Locale } from "~/lib/i18n/locale";

function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function StatusUptimeBadgeModal({
  open,
  onClose,
  copy,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  copy: StatusPageCopy;
  locale: Locale;
}) {
  const titleId = useId();
  const descId = useId();
  const previewHeadingId = useId();
  const [copied, setCopied] = useState<"iframe" | "json" | null>(null);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");

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
    if (!open) return;
    const isDark = document.documentElement.classList.contains("dark");
    setPreviewTheme(isDark ? "dark" : "light");
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const tmr = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(tmr);
  }, [copied]);

  if (!open) return null;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const badgeParams = new URLSearchParams({
    locale,
    theme: previewTheme,
  });
  const badgeUrl = `${origin}/api/status/uptime/badge?${badgeParams.toString()}`;
  const jsonUrl = `${origin}/api/status/uptime?locale=${locale}`;
  const iframeTitleEscaped = escapeHtmlAttr(copy.embedIframeTitle);
  const iframeSnippet =
    origin.length > 0
      ? `<iframe
  src="${badgeUrl}"
  title="${iframeTitleEscaped}"
  width="280"
  height="168"
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

  const previewChrome =
    previewTheme === "light"
      ? "border-zinc-200 bg-zinc-100 dark:border-zinc-700"
      : "border-zinc-700 bg-zinc-950";

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
            {copy.embedModalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            {copy.embedModalClose}
          </button>
        </div>
        <p
          id={descId}
          className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
        >
          {copy.embedModalIntro}
        </p>

        <section className="mt-5" aria-labelledby={previewHeadingId}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3
              id={previewHeadingId}
              className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
            >
              {copy.embedPreviewHeading}
            </h3>
            <fieldset className="m-0 inline-flex rounded-lg border border-zinc-200 bg-zinc-100/90 p-0.5 dark:border-zinc-600 dark:bg-zinc-800/90">
              <legend className="sr-only">{copy.embedThemeLabel}</legend>
              <label
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  previewTheme === "light"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <input
                  type="radio"
                  name="badge-preview-theme"
                  value="light"
                  checked={previewTheme === "light"}
                  onChange={() => setPreviewTheme("light")}
                  className="sr-only"
                />
                {copy.embedThemeLight}
              </label>
              <label
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  previewTheme === "dark"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <input
                  type="radio"
                  name="badge-preview-theme"
                  value="dark"
                  checked={previewTheme === "dark"}
                  onChange={() => setPreviewTheme("dark")}
                  className="sr-only"
                />
                {copy.embedThemeDark}
              </label>
            </fieldset>
          </div>
          <div
            className={`mt-3 flex min-h-[184px] items-center justify-center overflow-hidden rounded-xl border p-4 ${previewChrome}`}
          >
            {origin ? (
              <iframe
                key={`${locale}-${previewTheme}`}
                src={badgeUrl}
                title={`${copy.embedPreviewHeading}: ${copy.embedIframeTitle}`}
                width={280}
                height={168}
                className="rounded-[10px] border-0 shadow-md"
                loading="lazy"
              />
            ) : (
              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                {copy.embedOpenOnSite}
              </p>
            )}
          </div>
        </section>

        <section className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {copy.embedIframeHeading}
            </h3>
            <button
              type="button"
              disabled={!iframeSnippet}
              onClick={() => copyText(iframeSnippet, "iframe")}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {copied === "iframe" ? copy.embedCopied : copy.embedCopy}
            </button>
          </div>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[0.7rem] leading-relaxed text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
            <code>
              {iframeSnippet || copy.embedOpenOnSite}
            </code>
          </pre>
        </section>

        <section className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {copy.embedJsonHeading}
            </h3>
            <button
              type="button"
              disabled={origin.length === 0}
              onClick={() => copyText(jsonUrl, "json")}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {copied === "json" ? copy.embedCopied : copy.embedCopy}
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {copy.embedJsonHint}
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[0.7rem] leading-relaxed text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
            <code>{origin ? jsonUrl : copy.embedOpenOnSite}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}
