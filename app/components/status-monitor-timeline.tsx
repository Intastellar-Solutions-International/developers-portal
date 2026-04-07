import { interpolate } from "~/lib/i18n/messages";
import type { StatusPageCopy } from "~/lib/status-page-copy";
import type {
  StatusTimelinePoint,
  StatusTimelineSegmentKind,
} from "~/lib/status-history.server";

type Props = {
  points: StatusTimelinePoint[];
  liveSingleCheck?: boolean;
  copy: StatusPageCopy;
  historyWindowHours: number;
};

/**
 * Horizontal bar of segments — one per stored cron run (oldest left, newest right).
 */
export function StatusMonitorTimeline({
  points,
  liveSingleCheck,
  copy,
  historyWindowHours,
}: Props) {
  if (points.length === 0) {
    return (
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
        {copy.timelineNoHistory}
      </p>
    );
  }

  const clear = points.filter((p) => p.segmentKind === "up").length;
  const flagged = points.length - clear;

  const issuePointsNewestFirst = points
    .filter((p) => p.segmentKind !== "up")
    .slice()
    .reverse();
  const issueShow = issuePointsNewestFirst.slice(0, 18);
  const issueMore = issuePointsNewestFirst.length - issueShow.length;

  function segmentTooltip(p: StatusTimelinePoint): string {
    const time = p.checkedAtLabel;
    switch (p.segmentKind) {
      case "up":
        return interpolate(copy.timelineTooltipUp, { time });
      case "probe_down":
        return interpolate(copy.timelineTooltipDown, { time });
      case "operator_notice":
        return interpolate(copy.timelineTooltipNotice, { time });
      case "maintenance":
        return interpolate(copy.timelineTooltipMaintenance, { time });
      default: {
        const _exhaustive: never = p.segmentKind;
        return _exhaustive;
      }
    }
  }

  function segmentClass(kind: StatusTimelineSegmentKind): string {
    switch (kind) {
      case "up":
        return "bg-transparent";
      case "probe_down":
        return "bg-red-600 dark:bg-red-500";
      case "operator_notice":
        return "bg-amber-400 dark:bg-amber-500";
      case "maintenance":
        return "bg-sky-600 dark:bg-sky-500";
      default: {
        const _exhaustive: never = kind;
        return _exhaustive;
      }
    }
  }

  function issueKindLabel(kind: StatusTimelineSegmentKind): string {
    switch (kind) {
      case "probe_down":
        return copy.timelineIssueLabelDown;
      case "operator_notice":
        return copy.timelineIssueLabelNotice;
      case "maintenance":
        return copy.timelineIssueLabelMaintenance;
      case "up":
        return "";
      default: {
        const _exhaustive: never = kind;
        return _exhaustive;
      }
    }
  }

  function issueTimeClass(kind: StatusTimelineSegmentKind): string {
    switch (kind) {
      case "probe_down":
        return "text-red-700 dark:text-red-300";
      case "operator_notice":
        return "text-amber-800 dark:text-amber-200";
      case "maintenance":
        return "text-sky-800 dark:text-sky-200";
      case "up":
        return "";
      default: {
        const _exhaustive: never = kind;
        return _exhaustive;
      }
    }
  }

  return (
    <div className="mt-3">
      <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {liveSingleCheck
          ? copy.timelineCurrentCheckDev
          : interpolate(copy.timelineRecentChecks, {
              count: points.length,
              hours: historyWindowHours,
            })}
      </p>
      <div
        className="flex h-5 w-full max-w-md overflow-hidden rounded-md bg-emerald-500 shadow-inner dark:bg-emerald-600"
        role="img"
        aria-label={interpolate(copy.timelineAriaSummary, {
          n: points.length,
          clear,
          flagged,
        })}
      >
        {points.map((p, i) => (
          <span
            key={`${p.checkedAt}-${i}`}
            title={segmentTooltip(p)}
            className={`min-h-full min-w-0 flex-1 ${segmentClass(p.segmentKind)} ${
              p.segmentKind !== "up"
                ? "relative z-10 ring-1 ring-white/40 dark:ring-zinc-950/50"
                : ""
            }`}
          />
        ))}
      </div>
      {!liveSingleCheck && issueShow.length > 0 ? (
        <div className="mt-2 max-w-md">
          <p className="text-[0.65rem] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {copy.timelineIssueListIntro}
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-zinc-600 dark:text-zinc-400">
            {issueShow.map((p, idx) => (
              <li key={`${p.checkedAt}-${idx}`}>
                <time
                  dateTime={p.checkedAt}
                  className={`font-semibold tabular-nums ${issueTimeClass(p.segmentKind)}`}
                >
                  {p.checkedAtLabel}
                </time>
                <span className="text-zinc-500 dark:text-zinc-500">
                  {" "}
                  — {issueKindLabel(p.segmentKind)}
                </span>
              </li>
            ))}
          </ul>
          {issueMore > 0 ? (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              {interpolate(copy.timelineIssueMore, { n: issueMore })}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
