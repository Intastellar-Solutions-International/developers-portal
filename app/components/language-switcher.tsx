import { useEffect, useId, useRef, useState } from "react";

import {
  LOCALE_FLAG_EMOJI,
  SUPPORTED_LOCALES,
  localeToShortLabel,
  type Locale,
} from "~/lib/i18n/locale";
import { useI18n } from "~/providers/i18n-provider";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const triggerClass =
  "inline-flex h-9 items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 text-lg leading-none shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-600 dark:bg-zinc-900 dark:hover:border-zinc-500 dark:hover:bg-zinc-800";

const listClass =
  "absolute right-0 z-[100] mt-1 min-w-[8.5rem] rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-600 dark:bg-zinc-800";

const optionClass =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700/80";

const optionActiveClass =
  "bg-brand/10 font-medium text-brand dark:bg-brand/15 dark:text-brand";

function LanguageFlagMenu({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const btnId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (l: Locale) => {
    setLocale(l);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`.trim()} ref={wrapRef}>
      <button
        id={btnId}
        type="button"
        className={triggerClass}
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        aria-controls={listId}
        aria-label={`${t("lang.label")}: ${t(`lang.${locale}`)}`}
        title={`${t("lang.label")}: ${t(`lang.${locale}`)}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="select-none" aria-hidden>
          {LOCALE_FLAG_EMOJI[locale]}
        </span>
        <span
          className="select-none text-[0.7rem] font-semibold tabular-nums tracking-wide text-zinc-700 dark:text-zinc-200"
          aria-hidden
        >
          {localeToShortLabel(locale)}
        </span>
        <ChevronDownIcon className="size-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={btnId}
          className={listClass}
        >
          {SUPPORTED_LOCALES.map((l) => (
            <li key={l} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={l === locale ? "true" : "false"}
                className={`${optionClass} ${l === locale ? optionActiveClass : "text-zinc-800 dark:text-zinc-100"}`}
                onClick={() => pick(l)}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {LOCALE_FLAG_EMOJI[l]}
                </span>
                <span
                  className="w-11 shrink-0 text-xs font-semibold tabular-nums tracking-wide text-zinc-500 dark:text-zinc-400"
                  aria-hidden
                >
                  {localeToShortLabel(l)}
                </span>
                <span className="min-w-0">{t(`lang.${l}`)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  return <LanguageFlagMenu className={className} />;
}

/** Mobile drawer: labeled row of flag buttons (no nested menu). */
export function LanguageSwitcherMobileRow() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex w-full flex-col gap-2 px-4 py-2">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        {t("lang.label")}
      </span>
      <div
        className="flex gap-2"
        role="group"
        aria-label={t("lang.label")}
      >
        {SUPPORTED_LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-sm transition-colors ${
              l === locale
                ? "border-brand bg-brand/10 text-brand dark:bg-brand/15"
                : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500"
            }`}
            aria-pressed={l === locale ? "true" : "false"}
            aria-label={t(`lang.${l}`)}
            title={t(`lang.${l}`)}
            onClick={() => setLocale(l)}
          >
            <span className="text-2xl leading-none" aria-hidden>
              {LOCALE_FLAG_EMOJI[l]}
            </span>
            <span className="text-[0.65rem] font-semibold tabular-nums tracking-wide opacity-90">
              {localeToShortLabel(l)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
