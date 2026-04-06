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
          An <strong className="font-medium text-zinc-800 dark:text-zinc-200">incident</strong> is
          a stored cron run where at least one target was <strong className="font-medium">down</strong>{" "}
          (HTTP 5xx, timeout, or no response — same rules as the live checks). If everything in
          recent history passed, this list stays empty.
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
        Each row is one cron run where at least one check failed (newest first). Times are UTC.
        Messages come from the probe when available; older history rows may only show a generic
        reason.
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
            <ul className="mt-3 space-y-3 text-sm">
              {ev.failures.map((f) => (
                <li key={f.id} className="border-l-2 border-red-200 pl-3 dark:border-red-900/60">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {targetNames[f.id] ?? f.id}
                  </p>
                  <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">{f.summary}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
