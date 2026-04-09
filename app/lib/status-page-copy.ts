import type { Locale } from "~/lib/i18n/locale";
import { SUPPORTED_LOCALES } from "~/lib/i18n/locale";
import { interpolate, translatePath } from "~/lib/i18n/messages";

/** Singular/plural unit labels for rolling-window copy (badge, trust line, etc.). */
type WindowUnits = {
  day: [string, string];
  hour: [string, string];
  minute: [string, string];
};

const WINDOW_UNITS: Record<Locale, WindowUnits> = {
  en: {
    day: ["day", "days"],
    hour: ["hour", "hours"],
    minute: ["minute", "minutes"],
  },
  de: {
    day: ["Tag", "Tage"],
    hour: ["Stunde", "Stunden"],
    minute: ["Minute", "Minuten"],
  },
  da: {
    day: ["dag", "dage"],
    hour: ["time", "timer"],
    minute: ["minut", "minutter"],
  },
  fr: {
    day: ["jour", "jours"],
    hour: ["heure", "heures"],
    minute: ["minute", "minutes"],
  },
  nl: {
    day: ["dag", "dagen"],
    hour: ["uur", "uur"],
    minute: ["minuut", "minuten"],
  },
  "pt-br": {
    day: ["dia", "dias"],
    hour: ["hora", "horas"],
    minute: ["minuto", "minutos"],
  },
};

function pluralUnit(n: number, [one, many]: [string, string]): string {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * Human-readable duration for the configured history window (e.g. "90 days", "48 hours").
 * Used in status copy and the public uptime badge.
 */
export function formatWindowLabel(locale: Locale, hours: number): string {
  const units = WINDOW_UNITS[locale] ?? WINDOW_UNITS.en;
  const totalMinutes = Math.max(1, Math.round(hours * 60));
  if (totalMinutes >= 24 * 60) {
    const days = Math.floor(totalMinutes / (24 * 60));
    return pluralUnit(days, units.day);
  }
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) {
    return `${pluralUnit(h, units.hour)} ${pluralUnit(m, units.minute)}`;
  }
  if (h > 0) return pluralUnit(h, units.hour);
  return pluralUnit(m, units.minute);
}

// Compile-time guard: every locale must define window units.
void (SUPPORTED_LOCALES satisfies readonly (keyof typeof WINDOW_UNITS)[]);

/** Pre-resolved status UI strings for SSR + hydration (same pattern as `account.profile`). */
export type StatusPageCopy = {
  heading: string;
  introBeforeLink: string;
  introAfterLink: string;
  ariaUptimeStored: string;
  uptimeWord: string;
  uptimeStoredRunsBefore: string;
  uptimeStoredRunsMid: string;
  uptimeStoredRunsAfter: string;
  embedBadgeButton: string;
  ariaUptimeDev: string;
  onThisPageLoad: string;
  devUptimeNote: string;
  uptimePending: string;
  devLiveProbeBefore: string;
  devLiveProbeStrong: string;
  devLiveProbeAfter: string;
  noSnapshotCron: string;
  noSnapshotMongo: string;
  allChecksPassing: string;
  someChecksFailing: string;
  updated: string;
  storedUtc: string;
  utcOnly: string;
  httpStatus: string;
  noResponse: string;
  footnoteAria: string;
  footnoteTitle: string;
  footnoteP1Before: string;
  footnoteP1Strong: string;
  footnoteP1After: string;
  footnoteP2a: string;
  footnoteP2b: string;
  footnoteP2c: string;
  footnoteP2d: string;
  footnoteP2e: string;
  incidentHeading: string;
  incidentEmptyBody: string;
  incidentListIntro: string;
  degraded: string;
  timelineNoHistory: string;
  timelineCurrentCheckDev: string;
  timelineRecentChecks: string;
  timelineAriaSummary: string;
  timelineTooltipUp: string;
  timelineTooltipDown: string;
  timelineTooltipNotice: string;
  timelineTooltipMaintenance: string;
  timelineIssueListIntro: string;
  timelineIssueLabelDown: string;
  timelineIssueLabelNotice: string;
  timelineIssueLabelMaintenance: string;
  timelineIssueMore: string;
  latencyNeedsTwoRuns: string;
  latencyResponseTime: string;
  latencyAriaTrend: string;
  latencyMin: string;
  latencyMax: string;
  latencyLatest: string;
  latencyByRegionCaption: string;
  /** Label for the synthetic `primary` region when only one cron runs and `STATUS_PROBE_REGION` is unset. */
  latencyDefaultRegionLabel: string;
  embedModalTitle: string;
  embedModalClose: string;
  embedModalIntro: string;
  embedPreviewHeading: string;
  embedThemeLabel: string;
  embedThemeLight: string;
  embedThemeDark: string;
  embedIframeHeading: string;
  embedIframeTitle: string;
  embedJsonHeading: string;
  embedJsonHint: string;
  embedCopy: string;
  embedCopied: string;
  embedOpenOnSite: string;
  maintenanceHeading: string;
  maintenanceEmpty: string;
  maintenanceActiveBadge: string;
  maintenanceUpcomingBadge: string;
  maintenanceRange: string;
  deployHeading: string;
  deployUnavailable: string;
  deployCommit: string;
  deployBranch: string;
  deployMessage: string;
  deployViewCommit: string;
  trustHeading: string;
  trustIntro: string;
  trustBulletSynthetic: string;
  trustBulletFrequency: string;
  trustBulletPass: string;
  trustBulletHistory: string;
  trustBulletUtc: string;
  /** Rolling history window (hours); set in loader via `finalizeStatusPageCopy`. */
  statusHistoryWindowHours: number;
  /** Max rows cap per request; set in loader. */
  statusHistoryMaxRowsCap: number;
  manualNoticesHeading: string;
  manualNoticesIntro: string;
  manualPostedBy: string;
  manualResolvedPrefix: string;
  manualSeverityInvestigating: string;
  manualSeverityIdentified: string;
  manualSeverityMonitoring: string;
  manualSeverityResolved: string;
  /** Interpolation: {{atLabel}}, {{email}} */
  manualUpdateMeta: string;
  manualUpdatesHeading: string;
  affectedMonitorsLabel: string;
  subscribeRss: string;
  subscribeRssTitle: string;
  subscribeSectionHeading: string;
  subscribeSectionIntro: string;
  subscribeTopicsLabel: string;
  subscribeTopicMaintenance: string;
  subscribeTopicIncidents: string;
  subscribePickTopicsError: string;
  subscribeRssUrlHelp: string;
  subscribeOpenRss: string;
  subscribeCopyFeedUrl: string;
  subscribeCopied: string;
  subscribeEmailHelp: string;
  subscribeEmailCheckbox: string;
  subscribeEmailUnavailable: string;
  subscribeEmailInputLabel: string;
  subscribeEmailPlaceholder: string;
  subscribeEmailSubmit: string;
  subscribeEmailVerifySent: string;
  subscribeEmailUpdated: string;
  subscribeEmailErrorGeneric: string;
  notifyFlashVerified: string;
  notifyFlashUnsubscribed: string;
  notifyFlashVerifyMissing: string;
  notifyFlashVerifyInvalid: string;
  notifyFlashUnsubMissing: string;
  notifyFlashUnsubInvalid: string;
};

export function buildStatusPageCopyTemplates(locale: Locale): StatusPageCopy {
  const tp = (path: string) => translatePath(locale, path);
  return {
    heading: tp("status.heading"),
    introBeforeLink: tp("status.introBeforeLink"),
    introAfterLink: tp("status.introAfterLink"),
    ariaUptimeStored: tp("status.ariaUptimeStored"),
    uptimeWord: tp("status.uptimeWord"),
    uptimeStoredRunsBefore: tp("status.uptimeStoredRunsBefore"),
    uptimeStoredRunsMid: tp("status.uptimeStoredRunsMid"),
    uptimeStoredRunsAfter: tp("status.uptimeStoredRunsAfter"),
    embedBadgeButton: tp("status.embedBadgeButton"),
    ariaUptimeDev: tp("status.ariaUptimeDev"),
    onThisPageLoad: tp("status.onThisPageLoad"),
    devUptimeNote: tp("status.devUptimeNote"),
    uptimePending: tp("status.uptimePending"),
    devLiveProbeBefore: tp("status.devLiveProbeBefore"),
    devLiveProbeStrong: tp("status.devLiveProbeStrong"),
    devLiveProbeAfter: tp("status.devLiveProbeAfter"),
    noSnapshotCron: tp("status.noSnapshotCron"),
    noSnapshotMongo: tp("status.noSnapshotMongo"),
    allChecksPassing: tp("status.allChecksPassing"),
    someChecksFailing: tp("status.someChecksFailing"),
    updated: tp("status.updated"),
    storedUtc: tp("status.storedUtc"),
    utcOnly: tp("status.utcOnly"),
    httpStatus: tp("status.httpStatus"),
    noResponse: tp("status.noResponse"),
    footnoteAria: tp("status.footnoteAria"),
    footnoteTitle: tp("status.footnoteTitle"),
    footnoteP1Before: tp("status.footnoteP1Before"),
    footnoteP1Strong: tp("status.footnoteP1Strong"),
    footnoteP1After: tp("status.footnoteP1After"),
    footnoteP2a: tp("status.footnoteP2a"),
    footnoteP2b: tp("status.footnoteP2b"),
    footnoteP2c: tp("status.footnoteP2c"),
    footnoteP2d: tp("status.footnoteP2d"),
    footnoteP2e: tp("status.footnoteP2e"),
    incidentHeading: tp("status.incidentHeading"),
    incidentEmptyBody: tp("status.incidentEmptyBody"),
    incidentListIntro: tp("status.incidentListIntro"),
    degraded: tp("status.degraded"),
    timelineNoHistory: tp("status.timelineNoHistory"),
    timelineCurrentCheckDev: tp("status.timelineCurrentCheckDev"),
    timelineRecentChecks: tp("status.timelineRecentChecks"),
    timelineAriaSummary: tp("status.timelineAriaSummary"),
    timelineTooltipUp: tp("status.timelineTooltipUp"),
    timelineTooltipDown: tp("status.timelineTooltipDown"),
    timelineTooltipNotice: tp("status.timelineTooltipNotice"),
    timelineTooltipMaintenance: tp("status.timelineTooltipMaintenance"),
    timelineIssueListIntro: tp("status.timelineIssueListIntro"),
    timelineIssueLabelDown: tp("status.timelineIssueLabelDown"),
    timelineIssueLabelNotice: tp("status.timelineIssueLabelNotice"),
    timelineIssueLabelMaintenance: tp("status.timelineIssueLabelMaintenance"),
    timelineIssueMore: tp("status.timelineIssueMore"),
    latencyNeedsTwoRuns: tp("status.latencyNeedsTwoRuns"),
    latencyResponseTime: tp("status.latencyResponseTime"),
    latencyAriaTrend: tp("status.latencyAriaTrend"),
    latencyMin: tp("status.latencyMin"),
    latencyMax: tp("status.latencyMax"),
    latencyLatest: tp("status.latencyLatest"),
    latencyByRegionCaption: tp("status.latencyByRegionCaption"),
    latencyDefaultRegionLabel: tp("status.latencyDefaultRegionLabel"),
    embedModalTitle: tp("status.embedModalTitle"),
    embedModalClose: tp("status.embedModalClose"),
    embedModalIntro: tp("status.embedModalIntro"),
    embedPreviewHeading: tp("status.embedPreviewHeading"),
    embedThemeLabel: tp("status.embedThemeLabel"),
    embedThemeLight: tp("a11y.lightTheme"),
    embedThemeDark: tp("a11y.darkTheme"),
    embedIframeHeading: tp("status.embedIframeHeading"),
    embedIframeTitle: tp("status.embedIframeTitle"),
    embedJsonHeading: tp("status.embedJsonHeading"),
    embedJsonHint: tp("status.embedJsonHint"),
    embedCopy: tp("status.embedCopy"),
    embedCopied: tp("status.embedCopied"),
    embedOpenOnSite: tp("status.embedOpenOnSite"),
    maintenanceHeading: tp("status.maintenanceHeading"),
    maintenanceEmpty: tp("status.maintenanceEmpty"),
    maintenanceActiveBadge: tp("status.maintenanceActiveBadge"),
    maintenanceUpcomingBadge: tp("status.maintenanceUpcomingBadge"),
    maintenanceRange: tp("status.maintenanceRange"),
    deployHeading: tp("status.deployHeading"),
    deployUnavailable: tp("status.deployUnavailable"),
    deployCommit: tp("status.deployCommit"),
    deployBranch: tp("status.deployBranch"),
    deployMessage: tp("status.deployMessage"),
    deployViewCommit: tp("status.deployViewCommit"),
    trustHeading: tp("status.trustHeading"),
    trustIntro: tp("status.trustIntro"),
    trustBulletSynthetic: tp("status.trustBulletSynthetic"),
    trustBulletFrequency: tp("status.trustBulletFrequency"),
    trustBulletPass: tp("status.trustBulletPass"),
    trustBulletHistory: tp("status.trustBulletHistory"),
    trustBulletUtc: tp("status.trustBulletUtc"),
    statusHistoryWindowHours: 0,
    statusHistoryMaxRowsCap: 0,
    manualNoticesHeading: tp("status.manualNoticesHeading"),
    manualNoticesIntro: tp("status.manualNoticesIntro"),
    manualPostedBy: tp("status.manualPostedBy"),
    manualResolvedPrefix: tp("status.manualResolvedPrefix"),
    manualSeverityInvestigating: tp("status.manualSeverityInvestigating"),
    manualSeverityIdentified: tp("status.manualSeverityIdentified"),
    manualSeverityMonitoring: tp("status.manualSeverityMonitoring"),
    manualSeverityResolved: tp("status.manualSeverityResolved"),
    manualUpdateMeta: tp("status.manualUpdateMeta"),
    manualUpdatesHeading: tp("status.manualUpdatesHeading"),
    affectedMonitorsLabel: tp("status.affectedMonitorsLabel"),
    subscribeRss: tp("status.subscribeRss"),
    subscribeRssTitle: tp("status.subscribeRssTitle"),
    subscribeSectionHeading: tp("status.subscribeSectionHeading"),
    subscribeSectionIntro: tp("status.subscribeSectionIntro"),
    subscribeTopicsLabel: tp("status.subscribeTopicsLabel"),
    subscribeTopicMaintenance: tp("status.subscribeTopicMaintenance"),
    subscribeTopicIncidents: tp("status.subscribeTopicIncidents"),
    subscribePickTopicsError: tp("status.subscribePickTopicsError"),
    subscribeRssUrlHelp: tp("status.subscribeRssUrlHelp"),
    subscribeOpenRss: tp("status.subscribeOpenRss"),
    subscribeCopyFeedUrl: tp("status.subscribeCopyFeedUrl"),
    subscribeCopied: tp("status.subscribeCopied"),
    subscribeEmailHelp: tp("status.subscribeEmailHelp"),
    subscribeEmailCheckbox: tp("status.subscribeEmailCheckbox"),
    subscribeEmailUnavailable: tp("status.subscribeEmailUnavailable"),
    subscribeEmailInputLabel: tp("status.subscribeEmailInputLabel"),
    subscribeEmailPlaceholder: tp("status.subscribeEmailPlaceholder"),
    subscribeEmailSubmit: tp("status.subscribeEmailSubmit"),
    subscribeEmailVerifySent: tp("status.subscribeEmailVerifySent"),
    subscribeEmailUpdated: tp("status.subscribeEmailUpdated"),
    subscribeEmailErrorGeneric: tp("status.subscribeEmailErrorGeneric"),
    notifyFlashVerified: tp("status.notifyFlashVerified"),
    notifyFlashUnsubscribed: tp("status.notifyFlashUnsubscribed"),
    notifyFlashVerifyMissing: tp("status.notifyFlashVerifyMissing"),
    notifyFlashVerifyInvalid: tp("status.notifyFlashVerifyInvalid"),
    notifyFlashUnsubMissing: tp("status.notifyFlashUnsubMissing"),
    notifyFlashUnsubInvalid: tp("status.notifyFlashUnsubInvalid"),
  };
}

/** Bakes env window + row cap into copy strings that use `{{hours}}` / `{{maxRows}}`. */
export function finalizeStatusPageCopy(
  base: StatusPageCopy,
  hours: number,
  maxRows: number,
  locale: Locale,
  options?: { uptimeNarrativeHours?: number },
): StatusPageCopy {
  const uptimeHours = options?.uptimeNarrativeHours ?? hours;
  const windowForUptime = formatWindowLabel(locale, uptimeHours);
  const timelineWindow = formatWindowLabel(locale, hours);
  return {
    ...base,
    statusHistoryWindowHours: hours,
    statusHistoryMaxRowsCap: maxRows,
    trustBulletHistory: interpolate(base.trustBulletHistory, { hours, maxRows }),
    footnoteP2d: interpolate(base.footnoteP2d, { hours, maxRows }),
    uptimeStoredRunsBefore: interpolate(base.uptimeStoredRunsBefore, {
      hours: uptimeHours,
      window: windowForUptime,
    }),
    timelineRecentChecks: interpolate(base.timelineRecentChecks, {
      window: timelineWindow,
    }),
  };
}

export function getStatusPageCopyForLoader(
  locale: Locale,
  hours: number,
  maxRows: number,
): StatusPageCopy {
  return finalizeStatusPageCopy(buildStatusPageCopyTemplates(locale), hours, maxRows, locale);
}

export function getStatusPageCopy(locale: Locale): StatusPageCopy {
  return getStatusPageCopyForLoader(locale, 48, 5000);
}

/**
 * Prefer loader-serialized copy (SSR + navigations). Rebuild on the client when `copy` is
 * missing (e.g. HMR, stale flight data, or duplicate route ids) so UI never reads undefined.
 */
export function resolveStatusPageCopy(
  locale: Locale,
  fromLoader: StatusPageCopy | undefined | null,
): StatusPageCopy {
  const timelineHdr = fromLoader?.timelineRecentChecks;
  if (
    fromLoader != null &&
    typeof timelineHdr === "string" &&
    timelineHdr.includes("{{count}}") &&
    !timelineHdr.includes("{{window}}") &&
    typeof fromLoader.embedPreviewHeading === "string" &&
    typeof fromLoader.trustHeading === "string" &&
    typeof fromLoader.manualNoticesHeading === "string" &&
    typeof fromLoader.subscribeRss === "string" &&
    typeof fromLoader.subscribeSectionHeading === "string" &&
    typeof fromLoader.timelineIssueListIntro === "string" &&
    typeof fromLoader.latencyByRegionCaption === "string" &&
    typeof fromLoader.latencyDefaultRegionLabel === "string" &&
    typeof fromLoader.statusHistoryWindowHours === "number" &&
    typeof fromLoader.statusHistoryMaxRowsCap === "number"
  ) {
    return fromLoader;
  }
  return getStatusPageCopy(locale);
}
