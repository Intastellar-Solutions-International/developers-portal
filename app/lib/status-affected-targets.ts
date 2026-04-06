/** Client-safe helpers for mapping status monitor IDs to labels (no `.server` imports). */

export type StatusTargetRef = { id: string; name: string };

export function labelsForTargetIds(
  ids: string[] | undefined,
  targets: StatusTargetRef[],
): string[] {
  if (!ids?.length) return [];
  const m = new Map(targets.map((t) => [t.id, t.name] as const));
  return ids.map((id) => m.get(id) ?? id);
}

export function normalizeAffectedTargetIds(
  submitted: string[],
  validIds: Set<string>,
): string[] {
  const out: string[] = [];
  for (const id of submitted) {
    const t = id.trim();
    if (validIds.has(t) && !out.includes(t)) out.push(t);
  }
  return out;
}
