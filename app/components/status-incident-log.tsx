import { groupConsecutiveStatusIncidents } from "~/lib/status-incident-grouping";
import type { StatusPageCopy } from "~/lib/status-page-copy";
import type { StatusIncident } from "~/lib/status-history.server";

type Props = {
  /**
   * From the status loader — same JSON the server used to render. Avoids hydration mismatch
   * when deriving empty vs list only from records that may deserialize differently on the client.
   */
  incidentLogHasEntries?: boolean;
  incidentsByTarget?: Record<string, StatusIncident[]>;
  /** Display order (e.g. snapshot target ids). From loader when possible. */
  monitorOrder?: string[];
  targetNames: Record<string, string>;
  copy: StatusPageCopy;
};

export function StatusIncidentLog({
  incidentLogHasEntries,
  incidentsByTarget,
  monitorOrder,
  targetNames,
  copy,
}: Props) {
  const byTarget = incidentsByTarget ?? {};
  const order =
    monitorOrder != null && monitorOrder.length > 0
      ? monitorOrder
      : Object.keys(byTarget).sort();

  const derivedHasEntries = order.some((id) => (byTarget[id]?.length ?? 0) > 0);
  const showList =
    typeof incidentLogHasEntries === "boolean"
      ? incidentLogHasEntries
      : derivedHasEntries;

  if (!showList) {
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
      <div className="mt-4 space-y-8">
        {order.map((id) => {
          const raw = byTarget[id] ?? [];
          if (raw.length === 0) return null;
          const grouped = groupConsecutiveStatusIncidents(raw);
          return (
            <div key={id}>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {targetNames[id] ?? id}
              </h3>
              <ul className="mt-2 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
                {grouped.map((ev) => (
                  <li
                    key={`${id}-${ev.startAt}-${ev.endAt}-${ev.failures.map((f) => f.id).join(",")}`}
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
                    <ul className="mt-3 space-y-2 text-sm">
                      {ev.failures.map((f, fi) => (
                        <li
                          key={fi}
                          className="border-l-2 border-red-200 pl-3 text-zinc-600 dark:border-red-900/60 dark:text-zinc-400"
                        >
                          {f.summary}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
