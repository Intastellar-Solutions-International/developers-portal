import { formatUtcIncidentWindow } from "./format-datetime";
import type {
  StatusIncident,
  StatusIncidentFailure,
} from "./status-history.server";

export type GroupedStatusIncident = {
  startAt: string;
  endAt: string;
  /** Human-readable UTC window (single instant or range). */
  rangeLabel: string;
  failures: StatusIncidentFailure[];
};

function failureSignature(failures: StatusIncidentFailure[]): string {
  return [...failures]
    .map((f) => `${f.id}\0${f.summary}`)
    .sort()
    .join("\n");
}

/**
 * Merge consecutive stored failure runs (time-ordered) that share the same failing targets
 * and probe messages, then show one row per group with a UTC time window.
 */
export function groupConsecutiveStatusIncidents(
  incidents: StatusIncident[],
): GroupedStatusIncident[] {
  if (incidents.length === 0) return [];
  const sorted = [...incidents].sort(
    (a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime(),
  );
  const groups: GroupedStatusIncident[] = [];
  let i = 0;
  while (i < sorted.length) {
    const sig = failureSignature(sorted[i].failures);
    let j = i + 1;
    while (
      j < sorted.length &&
      failureSignature(sorted[j].failures) === sig
    ) {
      j += 1;
    }
    const chunk = sorted.slice(i, j);
    const startAt = chunk[0].checkedAt;
    const endAt = chunk[chunk.length - 1].checkedAt;
    groups.push({
      startAt,
      endAt,
      rangeLabel: formatUtcIncidentWindow(startAt, endAt),
      failures: chunk[0].failures,
    });
    i = j;
  }
  return groups.sort(
    (a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime(),
  );
}
