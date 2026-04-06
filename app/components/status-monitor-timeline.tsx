import type { StatusTimelinePoint } from "~/lib/status-history.server";

function formatTooltip(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type Props = {
  points: StatusTimelinePoint[];
  liveSingleCheck?: boolean;
};

/**
 * Horizontal bar of segments — one per stored cron run (oldest left, newest right).
 */
export function StatusMonitorTimeline({ points, liveSingleCheck }: Props) {
  if (points.length === 0) {
    return (
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
        No history yet. After MongoDB and cron store runs, recent checks appear
        here.
      </p>
    );
  }

  const fails = points.filter((p) => !p.ok).length;
  const ups = points.length - fails;

  return (
    <div className="mt-3">
      <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {liveSingleCheck ? "Current check only (dev)" : `Recent checks (${points.length})`}
      </p>
      <div
        className="flex h-5 w-full max-w-md gap-px rounded-md bg-zinc-200/80 p-px dark:bg-zinc-700/80"
        role="img"
        aria-label={`${points.length} checks: ${ups} up, ${fails} down`}
      >
        {points.map((p, i) => (
          <span
            key={`${p.checkedAt}-${i}`}
            title={`${formatTooltip(p.checkedAt)}${p.ok ? " — Up" : " — Down"}`}
            className={`min-w-0 flex-1 rounded-[1px] ${
              p.ok
                ? "bg-emerald-500 dark:bg-emerald-600"
                : "bg-red-500 dark:bg-red-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
