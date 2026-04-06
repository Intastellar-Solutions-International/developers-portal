import type { StatusTimelinePoint } from "~/lib/status-history.server";
import { useI18n } from "~/providers/i18n-provider";

type Props = {
  points: StatusTimelinePoint[];
  label: string;
};

/**
 * Sparkline of `latencyMs` across stored cron runs (oldest left). Ignores points without latency.
 */
export function StatusLatencyTrend({ points, label }: Props) {
  const { t } = useI18n();
  const withLatency = points.filter(
    (p): p is StatusTimelinePoint & { latencyMs: number } =>
      typeof p.latencyMs === "number" && Number.isFinite(p.latencyMs),
  );

  if (withLatency.length < 2) {
    return (
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
        {t("status.latencyNeedsTwoRuns")}
      </p>
    );
  }

  const values = withLatency.map((p) => p.latencyMs);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const w = 320;
  const h = 44;
  const pad = 4;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const n = withLatency.length;
  const pts = withLatency.map((p, i) => {
    const x = pad + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1));
    const y =
      pad + innerH - ((p.latencyMs - min) / span) * innerH || pad + innerH / 2;
    return { x, y, p };
  });
  const d = pts.map((o, i) => `${i === 0 ? "M" : "L"}${o.x.toFixed(1)} ${o.y.toFixed(1)}`).join(" ");

  return (
    <div className="mt-3">
      <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {t("status.latencyResponseTime", { label })}
      </p>
      <div className="flex max-w-md flex-wrap items-end gap-3">
        <svg
          className="text-brand dark:text-brand"
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={t("status.latencyAriaTrend", {
            label,
            min,
            max,
            n,
          })}
        >
          <line
            x1={pad}
            y1={h - pad}
            x2={w - pad}
            y2={h - pad}
            className="stroke-zinc-200 dark:stroke-zinc-700"
            strokeWidth={1}
          />
          <path
            d={d}
            fill="none"
            className="stroke-current"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-[0.7rem] leading-tight text-zinc-500 dark:text-zinc-400">
          <div>
            <span className="text-zinc-400 dark:text-zinc-500">
              {t("status.latencyMin")}{" "}
            </span>
            {min} ms
          </div>
          <div>
            <span className="text-zinc-400 dark:text-zinc-500">
              {t("status.latencyMax")}{" "}
            </span>
            {max} ms
          </div>
          <div>
            <span className="text-zinc-400 dark:text-zinc-500">
              {t("status.latencyLatest")}{" "}
            </span>
            {withLatency[withLatency.length - 1]!.latencyMs} ms
          </div>
        </div>
      </div>
    </div>
  );
}
