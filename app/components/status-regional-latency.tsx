import type { StatusRegionalSlice } from "~/lib/status-probe.server";
import type { StatusPageCopy } from "~/lib/status-page-copy";
import { defaultProbeRegionDisplayName } from "~/lib/status-probe-region-display";

type Props = {
  regions: Record<string, StatusRegionalSlice>;
  /** Custom labels from `STATUS_PROBE_REGION_LABELS` (loader-serialized). */
  regionLabels: Record<string, string>;
  copy: StatusPageCopy;
  /** e.g. `mt-3 sm:text-right` when shown beside the status summary */
  className?: string;
  /** Right-align the chip row on larger screens */
  alignEnd?: boolean;
};

export function StatusRegionalLatency({
  regions,
  regionLabels,
  copy,
  className = "",
  alignEnd = false,
}: Props) {
  const entries = Object.entries(regions).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return null;

  return (
    <div className={`mt-2 ${className}`.trim()}>
      <p
        className={`text-[0.65rem] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 ${alignEnd ? "sm:text-right" : ""}`}
      >
        {copy.latencyByRegionCaption}
      </p>
      <ul
        className={`mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs ${alignEnd ? "sm:justify-end" : ""}`}
      >
        {entries.map(([regionId, s]) => {
          const label = regionLabels[regionId] ?? defaultProbeRegionDisplayName(regionId);
          return (
            <li
              key={regionId}
              className="tabular-nums text-zinc-600 dark:text-zinc-400"
            >
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {label}
              </span>
              <span className="mx-1.5 text-zinc-400 dark:text-zinc-500">·</span>
              <span
                className={
                  s.ok
                    ? "font-medium text-emerald-700 dark:text-emerald-400"
                    : "font-medium text-red-600 dark:text-red-400"
                }
              >
                {s.latencyMs} ms
              </span>
              {!s.ok && s.error ? (
                <span className="ml-1 text-red-600/90 dark:text-red-400/90">
                  ({s.error})
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
