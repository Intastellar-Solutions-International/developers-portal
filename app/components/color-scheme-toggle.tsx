import { useSyncExternalStore } from "react";

import {
  getColorSchemeIsDarkServerSnapshot,
  getColorSchemeIsDarkSnapshot,
  subscribeColorScheme,
} from "~/lib/color-scheme";
import { useColorScheme } from "~/providers/color-scheme-provider";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function useResolvedColorSchemeIsDark(): boolean {
  return useSyncExternalStore(
    subscribeColorScheme,
    getColorSchemeIsDarkSnapshot,
    getColorSchemeIsDarkServerSnapshot,
  );
}

const trackClass =
  "inline-flex rounded-full bg-zinc-200/90 p-0.5 dark:bg-zinc-600/80";

const segmentClass =
  "flex h-9 w-9 items-center justify-center rounded-full transition-colors";

const segmentInactiveClass =
  "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100";

const segmentActiveClass =
  "bg-white text-brand shadow-sm dark:bg-zinc-800 dark:text-brand";

function SunMoonToggle({ className = "" }: { className?: string }) {
  const { setPreference } = useColorScheme();
  const isDark = useResolvedColorSchemeIsDark();

  return (
    <div
      className={`${trackClass} ${className}`.trim()}
      role="radiogroup"
      aria-label="Color theme"
    >
      <button
        type="button"
        role="radio"
        className={`${segmentClass} ${!isDark ? segmentActiveClass : segmentInactiveClass}`}
        aria-checked={!isDark}
        aria-label="Light theme"
        title="Light theme"
        onClick={() => setPreference("light")}
      >
        <SunIcon className="size-4.5" />
      </button>
      <button
        type="button"
        role="radio"
        className={`${segmentClass} ${isDark ? segmentActiveClass : segmentInactiveClass}`}
        aria-checked={isDark}
        aria-label="Dark theme"
        title="Dark theme"
        onClick={() => setPreference("dark")}
      >
        <MoonIcon className="size-4.5" />
      </button>
    </div>
  );
}

export function ColorSchemeToggle() {
  return <SunMoonToggle />;
}

/** Full-width row for the mobile drawer — icons only, same behavior as the header control. */
export function ColorSchemeToggleMobileRow() {
  return (
    <div className="flex w-full items-center justify-center px-4 py-2">
      <SunMoonToggle />
    </div>
  );
}
