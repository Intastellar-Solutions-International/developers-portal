import type { ManualIncidentPublic } from "~/lib/status-manual-incidents.server";
import type { StatusPageCopy } from "~/lib/status-page-copy";
import { interpolate } from "~/lib/i18n/messages";

function severityClass(
  s: ManualIncidentPublic["severity"],
): string {
  switch (s) {
    case "investigating":
      return "bg-amber-100 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100";
    case "identified":
      return "bg-orange-100 text-orange-950 dark:bg-orange-950/50 dark:text-orange-100";
    case "monitoring":
      return "bg-sky-100 text-sky-950 dark:bg-sky-950/50 dark:text-sky-100";
    case "resolved":
      return "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-100";
    default:
      return "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100";
  }
}

function severityLabel(
  copy: StatusPageCopy,
  s: ManualIncidentPublic["severity"],
): string {
  switch (s) {
    case "investigating":
      return copy.manualSeverityInvestigating;
    case "identified":
      return copy.manualSeverityIdentified;
    case "monitoring":
      return copy.manualSeverityMonitoring;
    case "resolved":
      return copy.manualSeverityResolved;
    default:
      return s;
  }
}

type Props = {
  incidents: ManualIncidentPublic[];
  copy: StatusPageCopy;
};

export function StatusManualIncidents({ incidents, copy }: Props) {
  if (incidents.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="status-manual-incidents-heading">
      <h2
        id="status-manual-incidents-heading"
        className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
      >
        {copy.manualNoticesHeading}
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {copy.manualNoticesIntro}
      </p>
      <ul className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
        {incidents.map((ev) => (
          <li key={ev.id} className="px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {ev.title}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                  {ev.body}
                </p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {interpolate(copy.manualPostedBy, { email: ev.authorEmail })}{" "}
                  ·{" "}
                  <time dateTime={ev.createdAt}>{ev.createdAtLabel}</time>
                  {ev.resolvedAt && ev.resolvedAtLabel ? (
                    <>
                      {" "}
                      · {copy.manualResolvedPrefix}{" "}
                      <time dateTime={ev.resolvedAt}>{ev.resolvedAtLabel}</time>
                    </>
                  ) : null}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${severityClass(ev.severity)}`}
              >
                {severityLabel(copy, ev.severity)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
