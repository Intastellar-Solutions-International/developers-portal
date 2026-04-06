import {
  colorSchemePreferenceLabel,
  type ColorSchemePreference,
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

function MonitorIcon({ className }: { className?: string }) {
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
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function iconForPreference(p: ColorSchemePreference) {
  if (p === "light") return SunIcon;
  if (p === "dark") return MoonIcon;
  return MonitorIcon;
}

const toggleBtnClass =
  "rounded-md p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-brand dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-brand";

export function ColorSchemeToggle() {
  const { preference, cyclePreference } = useColorScheme();
  const Icon = iconForPreference(preference);
  const label = colorSchemePreferenceLabel(preference);

  return (
    <button
      type="button"
      className={toggleBtnClass}
      onClick={() => cyclePreference()}
      title={`Theme: ${label} (click to cycle: system → light → dark)`}
      aria-label={`Color theme: ${label}. Click to cycle between system, light, and dark.`}
    >
      <Icon className="size-5" />
    </button>
  );
}

/** Same control with full-width styling for the mobile drawer. */
export function ColorSchemeToggleMobileRow() {
  const { preference, cyclePreference } = useColorScheme();
  const Icon = iconForPreference(preference);
  const label = colorSchemePreferenceLabel(preference);

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10"
      onClick={() => cyclePreference()}
      aria-label={`Color theme: ${label}. Click to cycle.`}
    >
      <Icon className="size-5 shrink-0 opacity-80" />
      <span>
        Theme: <span className="font-semibold">{label}</span>
      </span>
      <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-500">
        Tap to change
      </span>
    </button>
  );
}
