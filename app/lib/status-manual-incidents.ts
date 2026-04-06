/** Shared types/constants (safe for client + server). Server-only DB code lives in `status-manual-incidents.server.ts`. */

export const MANUAL_INCIDENT_SEVERITIES = [
  "investigating",
  "identified",
  "monitoring",
  "resolved",
] as const;

export type ManualIncidentSeverity = (typeof MANUAL_INCIDENT_SEVERITIES)[number];

/** Email payload after a persisted operator-notice update (server → notify dispatch). */
export type ManualIncidentUpdateNotifyPayload = {
  title: string;
  body: string;
  fromSeverity: ManualIncidentSeverity;
  toSeverity: ManualIncidentSeverity;
  affectedTargetIds?: string[];
  updateMessage: string;
};

export type ManualIncidentUpdatePublic = {
  at: string;
  atLabel: string;
  authorEmail: string;
  fromSeverity: ManualIncidentSeverity;
  toSeverity: ManualIncidentSeverity;
  /** Trimmed operator note (may be empty if only severity changed). */
  message: string;
};

export type ManualIncidentPublic = {
  id: string;
  title: string;
  body: string;
  severity: ManualIncidentSeverity;
  createdAt: string;
  createdAtLabel: string;
  authorEmail: string;
  resolvedAt: string | null;
  resolvedAtLabel: string | null;
  /** Monitor IDs from status targets (may be empty). */
  affectedTargetIds: string[];
  /** Human-readable monitor names aligned with `affectedTargetIds`. */
  affectedLabels: string[];
  /** Newest-first timeline of status changes / notes from operators. */
  updates: ManualIncidentUpdatePublic[];
};
