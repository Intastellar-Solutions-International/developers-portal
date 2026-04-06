import type { StatusIncident } from "~/lib/status-history.server";

type Props = {
  incidents: StatusIncident[];
  targetNames: Record<string, string>;
};

export function StatusIncidentLog({ incidents, targetNames }: Props) {
  if (incidents.length === 0) {
    return (
      <section className="mt-10" aria-labelledby="status-incidents-heading">
        <h2
          id="status-incidents-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Incident log
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          No failed checks in recent stored history. Incidents appear when a cron run records
          one or more targets as down.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10" aria-labelledby="status-incidents-heading">
      <h2
        id="status-incidents-heading"
        className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
      >
        Incident log
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Recent runs where at least one target failed (newest first). Times are UTC.
      </p>
      <ul className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
        {incidents.map((ev) => (
          <li key={ev.checkedAt} className="px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <time
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                dateTime={ev.checkedAt}
              >
                {ev.checkedAtLabel}
              </time>
              <span className="text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
                Degraded
              </span>
            </div>
            <ul className="mt-2 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
              {ev.failedIds.map((id) => (
                <li key={id}>{targetNames[id] ?? id}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
