import type { Route } from "./+types/api.status.json";
import {
  formatDateTimeMediumUtc,
} from "~/lib/format-datetime";
import { isMongoConfigured } from "~/lib/mongodb.server";
import { getStatusDeployPublic } from "~/lib/status-deploy.server";
import { listFutureMaintenanceWindowsFromMongo } from "~/lib/status-maintenance-db.server";
import { getPublicMaintenanceWindows } from "~/lib/status-maintenance.server";
import { listManualIncidentsPublic } from "~/lib/status-manual-incidents.server";
import { getLatestStatusSnapshot } from "~/lib/status-snapshot.server";

/** Public JSON for the status widget and integrations. */
export async function loader(_: Route.LoaderArgs) {
  const snapshot = await getLatestStatusSnapshot();
  const mongoMaint =
    isMongoConfigured() ? await listFutureMaintenanceWindowsFromMongo() : [];
  const maintenance = getPublicMaintenanceWindows(formatDateTimeMediumUtc, {
    mongoWindows: mongoMaint,
  });
  const deploy = getStatusDeployPublic();
  const manualIncidents =
    isMongoConfigured() ? await listManualIncidentsPublic(25) : [];
  const body = JSON.stringify({
    snapshot,
    maintenance,
    deploy,
    manualIncidents,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
