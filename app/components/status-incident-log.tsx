import { groupConsecutiveStatusIncidents } from "~/lib/status-incident-grouping";
import type { StatusPageCopy } from "~/lib/status-page-copy";
import type { StatusIncident } from "~/lib/status-history.server";

type Props = {
  incidents: StatusIncident[];
  targetNames: Record<string, string>;
  copy: StatusPageCopy;
};

export function StatusIncidentLog({ incidents, targetNames, copy }: Props) {
  const grouped = groupConsecutiveStatusIncidents(incidents);

  if (incidents.length === 0) {
    return (
      <section className="mt-10" aria-labelledby="status-incidents-heading">
        <h2
          id="status-incidents-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {copy.incidentHeading}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {copy.incidentEmptyBody}
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
        {copy.incidentHeading}
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {copy.incidentListIntro}
      </p>
      <ul className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
        {grouped.map((ev) => (
          <li
            key={`${ev.startAt}-${ev.endAt}-${ev.failures.map((f) => f.id).join(",")}`}
            className="px-4 py-3"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {ev.startAt === ev.endAt ? (
                  <time dateTime={ev.startAt}>{ev.rangeLabel}</time>
                ) : (
                  <span title={`${ev.startAt} → ${ev.endAt}`}>
                    {ev.rangeLabel}
                  </span>
                )}
              </p>
              <span className="text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
                {copy.degraded}
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
