export type UptimePercentTier = "good" | "warn" | "bad";

/**
 * Headline uptime styling: green ≥90%, orange ≥60% and &lt;90%, red &lt;60%.
 */
export function uptimePercentTier(percent: number): UptimePercentTier {
  if (percent >= 90) return "good";
  if (percent >= 60) return "warn";
  return "bad";
}

/** Tailwind classes for large headline uptime on `/status`. */
export const uptimePercentHeadlineClass: Record<UptimePercentTier, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  bad: "text-red-600 dark:text-red-400",
};
