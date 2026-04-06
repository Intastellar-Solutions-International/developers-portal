import { useI18n } from "~/providers/i18n-provider";

/**
 * “Formerly developers.intastellarsolutions.com” strip.
 * Shown when the document URL has `?ref=legacy`, or Referer is the legacy developers host
 * (see root loader), and the migration window in `~/lib/legacy-banner` is still active.
 */
export function LegacyDevelopersBanner() {
  const { t } = useI18n();
  return (
    <div
      role="note"
      className="fixed inset-x-0 top-15 z-40 border-b border-brand/35 bg-zinc-100 px-4 py-2.5 dark:border-brand/40 dark:bg-zinc-800"
    >
      <div className="mx-auto max-w-6xl text-center text-xs leading-snug text-zinc-800 sm:text-left sm:text-sm dark:text-zinc-200">
        <p>
          <span className="font-semibold text-zinc-950 dark:text-zinc-50">
            {t("legacy.line1Strong")}
          </span>
          <span className="text-zinc-700 dark:text-zinc-300">
            {t("legacy.line1Mid")}
            <strong className="font-medium text-zinc-900 dark:text-zinc-50">
              {t("legacy.line1Brand")}
            </strong>
            {t("legacy.line1AfterBrand")}
          </span>
        </p>
        <p className="mt-1 text-zinc-700 dark:text-zinc-300">
          {t("legacy.line2Before")}
          <span className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-zinc-700 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-200 sm:text-[0.7rem]">
            {t("legacy.badge")}
          </span>
          {t("legacy.line2After")}
        </p>
      </div>
    </div>
  );
}
