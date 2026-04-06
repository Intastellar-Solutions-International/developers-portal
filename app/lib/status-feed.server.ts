import {
  formatDateTimeMediumUtc,
} from "~/lib/format-datetime";
import { isMongoConfigured } from "~/lib/mongodb.server";
import { absoluteUrl } from "~/lib/site";
import { listFutureMaintenanceWindowsFromMongo } from "~/lib/status-maintenance-db.server";
import { getPublicMaintenanceWindows } from "~/lib/status-maintenance.server";
import { listManualIncidentsPublic } from "~/lib/status-manual-incidents.server";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rfc822(d: Date): string {
  return d.toUTCString();
}

type FeedItem = {
  title: string;
  link: string;
  guid: string;
  pubDate: Date;
  description: string;
};

export type StatusFeedTopics = {
  maintenance: boolean;
  incidents: boolean;
};

/** Comma-separated: `maintenance`, `incidents`. Empty / unknown → both. */
export function parseStatusFeedTopicsParam(raw: string | null): StatusFeedTopics {
  if (raw == null || raw.trim() === "") {
    return { maintenance: true, incidents: true };
  }
  const parts = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const maintenance = parts.includes("maintenance");
  const incidents = parts.includes("incidents");
  if (!maintenance && !incidents) {
    return { maintenance: true, incidents: true };
  }
  return { maintenance, incidents };
}

/**
 * RSS 2.0 feed for operator notices + scheduled maintenance (merged env + Mongo).
 */
export async function buildStatusRssXml(
  topics: StatusFeedTopics = { maintenance: true, incidents: true },
): Promise<string> {
  const statusUrl = absoluteUrl("/status");
  let channelTitle = "inta.dev — Status updates";
  let channelDesc =
    "Operator notices, scheduled maintenance windows, and links to the system status page.";
  if (topics.maintenance && !topics.incidents) {
    channelTitle += " (maintenance)";
    channelDesc = "Scheduled maintenance windows for inta.dev.";
  } else if (!topics.maintenance && topics.incidents) {
    channelTitle += " (operator notices)";
    channelDesc = "Operator notices for inta.dev.";
  }

  const items: FeedItem[] = [];

  if (topics.incidents && isMongoConfigured()) {
    const incidents = await listManualIncidentsPublic(40);
    for (const ev of incidents) {
      const extra =
        ev.affectedLabels.length > 0
          ? ` Monitors: ${ev.affectedLabels.join(", ")}.`
          : "";
      const bodyShort = ev.body.length > 1500 ? `${ev.body.slice(0, 1500)}…` : ev.body;
      let desc = `${bodyShort}${extra}`;
      if (ev.updates.length > 0) {
        const parts = ev.updates
          .slice()
          .sort((a, b) => a.at.localeCompare(b.at))
          .map((u) => {
            const sev =
              u.fromSeverity !== u.toSeverity
                ? ` ${u.fromSeverity}→${u.toSeverity}`
                : "";
            const note = u.message.trim() ? `\n${u.message.trim()}` : "";
            return `\n\n— ${u.atLabel} (${u.authorEmail})${sev}${note}`;
          });
        desc += parts.join("");
      }
      items.push({
        title: `[${ev.severity}] ${ev.title}`,
        link: statusUrl,
        guid: `inta.dev:manual-incident:${ev.id}`,
        pubDate: new Date(ev.createdAt),
        description: escapeXml(desc),
      });
    }
  }

  if (topics.maintenance) {
    const mongoMaint = isMongoConfigured()
      ? await listFutureMaintenanceWindowsFromMongo()
      : [];
    const maintViews = getPublicMaintenanceWindows(formatDateTimeMediumUtc, {
      mongoWindows: mongoMaint,
    });
    for (const w of maintViews) {
      const parts = [
        w.summary,
        w.affectedLabels.length > 0
          ? `May affect: ${w.affectedLabels.join(", ")}.`
          : null,
      ].filter(Boolean);
      const desc = parts.length ? parts.join(" ") : w.title;
      items.push({
        title: `Maintenance: ${w.title}`,
        link: statusUrl,
        guid: `inta.dev:maintenance:${w.id}:${w.startsAt}`,
        pubDate: new Date(w.startsAt),
        description: escapeXml(desc),
      });
    }
  }

  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  const top = items.slice(0, 50);

  const itemXml = top
    .map(
      (it) => `
    <item>
      <title>${escapeXml(it.title)}</title>
      <link>${escapeXml(it.link)}</link>
      <guid isPermaLink="false">${escapeXml(it.guid)}</guid>
      <pubDate>${rfc822(it.pubDate)}</pubDate>
      <description>${it.description}</description>
    </item>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(statusUrl)}</link>
    <description>${escapeXml(channelDesc)}</description>
    <language>en</language>
    <lastBuildDate>${rfc822(new Date())}</lastBuildDate>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <generator>inta.dev status feed</generator>${itemXml}
  </channel>
</rss>`;
}
