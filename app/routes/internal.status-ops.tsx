import { Form, data, redirect, useActionData, useLoaderData } from "react-router";

import type { Route } from "./+types/internal.status-ops";
import {
  deleteMaintenanceWindowById,
  insertMaintenanceWindow,
  listMaintenanceWindowsForAdmin,
} from "~/lib/status-maintenance-db.server";
import {
  MANUAL_INCIDENT_SEVERITIES,
  type ManualIncidentSeverity,
} from "~/lib/status-manual-incidents";
import {
  archiveManualIncidentById,
  insertManualIncident,
  insertManualIncidentWithTimeline,
  restoreManualIncidentById,
  listManualIncidentsForAdmin,
  type ManualIncidentUpdateRow,
  updateManualIncident,
} from "~/lib/status-manual-incidents.server";
import {
  notifySubscribersIncidentUpdate,
  notifySubscribersNewIncident,
  notifySubscribersNewMaintenance,
} from "~/lib/status-notify-dispatch.server";
import { isStatusAdminEmail, statusAdminConfigured } from "~/lib/status-admin.server";
import { isMongoConfigured } from "~/lib/mongodb.server";
import { resolvePortalSessionForRequest } from "~/lib/portal-account.server";
import { getStatusTargets } from "~/lib/status-targets.server";

function labelsForMonitorIds(
  ids: string[] | undefined,
  monitors: { id: string; name: string }[],
): string {
  if (!ids?.length) return "";
  const m = new Map(monitors.map((x) => [x.id, x.name] as const));
  return ids.map((id) => m.get(id) ?? id).join(", ");
}

export function meta() {
  return [{ name: "robots", content: "noindex, nofollow" }];
}

type MaintenanceAdminSerialized = {
  id: string;
  title: string;
  summary?: string;
  startsAt: string;
  endsAt: string;
  createdByEmail: string;
  affectedTargetIds?: string[];
};

type IncidentAdminSerialized = {
  id: string;
  title: string;
  body: string;
  severity: string;
  createdAt: string;
  affectedTargetIds?: string[];
  updatesCount: number;
  archived: boolean;
  archivedAt?: string;
};

type LoaderOk = {
  mode: "ok";
  email: string;
  monitors: { id: string; name: string }[];
  maintenance: MaintenanceAdminSerialized[];
  incidents: IncidentAdminSerialized[];
};

type LoaderData =
  | { mode: "disabled" }
  | { mode: "unauthenticated" }
  | { mode: "forbidden"; email: string }
  | { mode: "no_mongo"; email: string }
  | LoaderOk;

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  if (!statusAdminConfigured()) {
    return { mode: "disabled" };
  }
  const { account } = await resolvePortalSessionForRequest(request);
  if (!account?.email?.trim()) {
    return { mode: "unauthenticated" };
  }
  const email = account.email.trim();
  if (!isStatusAdminEmail(email)) {
    return { mode: "forbidden", email };
  }
  if (!isMongoConfigured()) {
    return { mode: "no_mongo", email };
  }
  const [maintRows, incRows] = await Promise.all([
    listMaintenanceWindowsForAdmin(100),
    listManualIncidentsForAdmin(100),
  ]);
  const monitors = getStatusTargets().map((t) => ({ id: t.id, name: t.name }));
  const maintenance: MaintenanceAdminSerialized[] = maintRows.map((w) => ({
    id: w.id,
    title: w.title,
    summary: w.summary,
    startsAt: w.startsAt.toISOString(),
    endsAt: w.endsAt.toISOString(),
    createdByEmail: w.createdByEmail,
    ...(w.affectedTargetIds?.length
      ? { affectedTargetIds: w.affectedTargetIds }
      : {}),
  }));
  const sortedIncidents = [...incRows].sort((a, b) => {
    const ad = a.deletedAt ? 1 : 0;
    const bd = b.deletedAt ? 1 : 0;
    if (ad !== bd) return ad - bd;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  const incidents: IncidentAdminSerialized[] = sortedIncidents.map((e) => ({
    id: e._id.toHexString(),
    title: e.title,
    body: e.body,
    severity: e.severity,
    createdAt: e.createdAt.toISOString(),
    updatesCount: e.updates?.length ?? 0,
    archived: Boolean(e.deletedAt),
    ...(e.deletedAt ? { archivedAt: e.deletedAt.toISOString() } : {}),
    ...(e.affectedTargetIds?.length
      ? { affectedTargetIds: e.affectedTargetIds }
      : {}),
  }));
  return { mode: "ok", email, monitors, maintenance, incidents };
}

type AdminGate =
  | { ok: true; email: string }
  | { ok: false; status: number; message: string };

async function requireAdmin(request: Request): Promise<AdminGate> {
  if (!statusAdminConfigured()) {
    return {
      ok: false,
      status: 404,
      message: "Status admin is not configured (set STATUS_ADMIN_EMAILS).",
    };
  }
  const { account } = await resolvePortalSessionForRequest(request);
  if (!account?.email?.trim()) {
    return { ok: false, status: 401, message: "Sign in required." };
  }
  const email = account.email.trim();
  if (!isStatusAdminEmail(email)) {
    return { ok: false, status: 403, message: "Not authorized." };
  }
  if (!isMongoConfigured()) {
    return { ok: false, status: 503, message: "MongoDB is not configured." };
  }
  return { ok: true, email };
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }
  const gate = await requireAdmin(request);
  if (!gate.ok) {
    return data({ error: gate.message }, { status: gate.status });
  }
  const { email } = gate;
  const fd = await request.formData();
  const intent = String(fd.get("intent") ?? "");
  const affectedTargets = fd
    .getAll("affectedTargets")
    .map((x) => String(x).trim())
    .filter(Boolean);

  if (intent === "create-maintenance") {
    const id = String(fd.get("id") ?? "").trim();
    const title = String(fd.get("title") ?? "").trim();
    const summary = String(fd.get("summary") ?? "").trim();
    const startsAtRaw = String(fd.get("startsAt") ?? "").trim();
    const endsAtRaw = String(fd.get("endsAt") ?? "").trim();
    const startsAt = new Date(startsAtRaw);
    const endsAt = new Date(endsAtRaw);
    const ins = await insertMaintenanceWindow({
      id,
      title,
      summary: summary || undefined,
      startsAt,
      endsAt,
      affectedTargetIds: affectedTargets,
      createdByEmail: email,
    });
    if (!ins.ok) {
      return data({ error: ins.error }, { status: 400 });
    }
    await notifySubscribersNewMaintenance({
      title,
      summary: summary || undefined,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      affectedTargetIds: affectedTargets,
    });
    return redirect("/internal/status-ops");
  }

  if (intent === "delete-maintenance") {
    const id = String(fd.get("id") ?? "").trim();
    const ok = await deleteMaintenanceWindowById(id);
    if (!ok) {
      return data({ error: "Could not delete maintenance window." }, { status: 400 });
    }
    return redirect("/internal/status-ops");
  }

  if (intent === "create-incident") {
    const title = String(fd.get("title") ?? "").trim();
    const body = String(fd.get("body") ?? "");
    const severityRaw = String(fd.get("severity") ?? "");
    if (!MANUAL_INCIDENT_SEVERITIES.includes(severityRaw as ManualIncidentSeverity)) {
      return data({ error: "Invalid severity." }, { status: 400 });
    }
    const severity = severityRaw as ManualIncidentSeverity;
    const ins = await insertManualIncident({
      title,
      body,
      severity,
      affectedTargetIds: affectedTargets,
      authorEmail: email,
    });
    if (!ins.ok) {
      return data({ error: ins.error }, { status: 400 });
    }
    await notifySubscribersNewIncident({
      title,
      body,
      severity,
      affectedTargetIds: affectedTargets,
    });
    return redirect("/internal/status-ops");
  }

  if (intent === "import-incident-timeline") {
    const title = String(fd.get("importTitle") ?? "").trim();
    const body = String(fd.get("importBody") ?? "");
    const severityRaw = String(fd.get("importSeverity") ?? "");
    const noticeAuthor =
      String(fd.get("noticeAuthorEmail") ?? "").trim() || email;
    const createdAtRaw = String(fd.get("importCreatedAt") ?? "").trim();
    const resolvedAtRaw = String(fd.get("importResolvedAt") ?? "").trim();
    const importTargets = fd
      .getAll("importAffectedTargets")
      .map((x) => String(x).trim())
      .filter(Boolean);
    if (!MANUAL_INCIDENT_SEVERITIES.includes(severityRaw as ManualIncidentSeverity)) {
      return data({ error: "Invalid severity (import)." }, { status: 400 });
    }
    const severity = severityRaw as ManualIncidentSeverity;
    const createdAt = new Date(createdAtRaw);
    const resolvedAtParsed = resolvedAtRaw
      ? new Date(resolvedAtRaw)
      : null;
    const resolvedAt =
      severity === "resolved"
        ? resolvedAtParsed
        : null;
    const updateAtRaw = String(fd.get("importUpdateAt") ?? "").trim();
    const updateFromRaw = String(fd.get("importUpdateFromSeverity") ?? "");
    const updateToRaw = String(fd.get("importUpdateToSeverity") ?? "");
    const updateAuthor =
      String(fd.get("importUpdateAuthorEmail") ?? "").trim() || email;
    const updateMessage = String(fd.get("importUpdateMessage") ?? "").trim();
    let updates: ManualIncidentUpdateRow[] | undefined;
    if (updateAtRaw) {
      if (!updateFromRaw || !updateToRaw) {
        return data(
          {
            error:
              "When update time is set, choose both from and to severity for that update.",
          },
          { status: 400 },
        );
      }
      if (
        !MANUAL_INCIDENT_SEVERITIES.includes(
          updateFromRaw as ManualIncidentSeverity,
        ) ||
        !MANUAL_INCIDENT_SEVERITIES.includes(updateToRaw as ManualIncidentSeverity)
      ) {
        return data(
          { error: "Import update needs valid from/to severities." },
          { status: 400 },
        );
      }
      const at = new Date(updateAtRaw);
      updates = [
        {
          at,
          authorEmail: updateAuthor.trim().toLowerCase(),
          fromSeverity: updateFromRaw as ManualIncidentSeverity,
          toSeverity: updateToRaw as ManualIncidentSeverity,
          message: updateMessage,
        },
      ];
    } else if (updateFromRaw || updateToRaw || updateMessage) {
      return data(
        {
          error:
            "Fill “Update at (UTC)” when you add an update message or severities.",
        },
        { status: 400 },
      );
    }
    const ins = await insertManualIncidentWithTimeline({
      title,
      body,
      severity,
      authorEmail: noticeAuthor,
      affectedTargetIds: importTargets,
      createdAt,
      resolvedAt,
      updates,
    });
    if (!ins.ok) {
      return data({ error: ins.error }, { status: 400 });
    }
    return redirect("/internal/status-ops");
  }

  if (intent === "update-incident-severity") {
    const incidentId = String(fd.get("incidentId") ?? "").trim();
    const severityRaw = String(fd.get("severity") ?? "");
    const updateMessage = String(fd.get("updateMessage") ?? "");
    if (!MANUAL_INCIDENT_SEVERITIES.includes(severityRaw as ManualIncidentSeverity)) {
      return data({ error: "Invalid severity." }, { status: 400 });
    }
    const severity = severityRaw as ManualIncidentSeverity;
    const upd = await updateManualIncident({
      hexId: incidentId,
      severity,
      message: updateMessage,
      authorEmail: email,
    });
    if (!upd.ok) {
      return data({ error: upd.error }, { status: 400 });
    }
    if (!upd.skipped) {
      await notifySubscribersIncidentUpdate(upd.notify);
    }
    return redirect("/internal/status-ops");
  }

  if (intent === "archive-incident") {
    const id = String(fd.get("incidentId") ?? "").trim();
    const ok = await archiveManualIncidentById(id);
    if (!ok) {
      return data(
        { error: "Could not archive incident (already archived or missing)." },
        { status: 400 },
      );
    }
    return redirect("/internal/status-ops");
  }

  if (intent === "restore-incident") {
    const id = String(fd.get("incidentId") ?? "").trim();
    const ok = await restoreManualIncidentById(id);
    if (!ok) {
      return data(
        { error: "Could not restore incident (not archived or missing)." },
        { status: 400 },
      );
    }
    return redirect("/internal/status-ops");
  }

  return data({ error: "Unknown intent." }, { status: 400 });
}

const box =
  "rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900/50";

export default function InternalStatusOps() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as
    | { error?: string }
    | undefined;

  if (loaderData.mode === "disabled") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Status operations
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This route is disabled. Set{" "}
          <code className="rounded bg-zinc-100 px-1 font-mono text-xs dark:bg-zinc-800">
            STATUS_ADMIN_EMAILS
          </code>{" "}
          to a comma-separated list of operator emails.
        </p>
      </div>
    );
  }

  if (loaderData.mode === "unauthenticated") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Status operations
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in with an allowed account, then open this URL again.
        </p>
        <p className="mt-4">
          <a
            href="/account/login"
            className="text-brand hover:text-brand-hover"
          >
            Sign in →
          </a>
        </p>
      </div>
    );
  }

  if (loaderData.mode === "forbidden") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Not authorized
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as {loaderData.email}, but this address is not in{" "}
          <code className="rounded bg-zinc-100 px-1 font-mono text-xs dark:bg-zinc-800">
            STATUS_ADMIN_EMAILS
          </code>
          .
        </p>
      </div>
    );
  }

  if (loaderData.mode === "no_mongo") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          MongoDB required
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Configure{" "}
          <code className="rounded bg-zinc-100 px-1 font-mono text-xs dark:bg-zinc-800">
            MONGODB_URI
          </code>{" "}
          for this project. Signed in as {loaderData.email}.
        </p>
      </div>
    );
  }

  const { email, monitors, maintenance, incidents } = loaderData;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Status operations
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Signed in as {email}. Private tooling — not linked from the public site.
      </p>

      {actionData?.error ? (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
          role="alert"
        >
          {actionData.error}
        </p>
      ) : null}

      <section className={`${box} mt-8`}>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          Scheduled maintenance
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Stored in MongoDB and merged with{" "}
          <code className="rounded bg-zinc-100 px-1 font-mono dark:bg-zinc-800">
            STATUS_MAINTENANCE_JSON
          </code>{" "}
          on the public status page (same <code className="font-mono">id</code>{" "}
          from DB overrides env).
        </p>

        <Form method="post" className="mt-6 space-y-3">
          <input type="hidden" name="intent" value="create-maintenance" />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Id (slug)</span>
              <input
                name="id"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
                placeholder="e.g. db-may-2026"
                autoComplete="off"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-600 dark:text-zinc-400">Title</span>
              <input
                name="title"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-600 dark:text-zinc-400">
                Summary (optional)
              </span>
              <input
                name="summary"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Starts at (ISO 8601 UTC)
              </span>
              <input
                name="startsAt"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
                placeholder="2026-05-01T02:00:00.000Z"
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Ends at (ISO 8601 UTC)
              </span>
              <input
                name="endsAt"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
                placeholder="2026-05-01T04:00:00.000Z"
              />
            </label>
          </div>
          {monitors.length > 0 ? (
            <fieldset>
              <legend className="text-sm text-zinc-600 dark:text-zinc-400">
                May affect monitors (optional)
              </legend>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {monitors.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200"
                  >
                    <input
                      type="checkbox"
                      name="affectedTargets"
                      value={m.id}
                      className="rounded border-zinc-300 dark:border-zinc-600"
                    />
                    {m.name}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Add maintenance window
          </button>
        </Form>

        {maintenance.length > 0 ? (
          <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-700">
            {maintenance.map((w) => (
              <li
                key={w.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {w.title}{" "}
                    <span className="font-mono text-xs text-zinc-500">
                      ({w.id})
                    </span>
                  </p>
                  <p className="font-mono text-xs text-zinc-500">
                    {w.startsAt} → {w.endsAt}
                  </p>
                  {w.affectedTargetIds?.length ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      Monitors:{" "}
                      {labelsForMonitorIds(w.affectedTargetIds, monitors)}
                    </p>
                  ) : null}
                </div>
                <Form method="post">
                  <input type="hidden" name="intent" value="delete-maintenance" />
                  <input type="hidden" name="id" value={w.id} />
                  <button
                    type="submit"
                    className="text-sm text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete
                  </button>
                </Form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-zinc-500">No windows in the database yet.</p>
        )}
      </section>

      <section className={`${box} mt-8`}>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          Incident reports
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Shown on the public{" "}
          <a href="/status" className="text-brand hover:text-brand-hover">
            /status
          </a>{" "}
          page under &quot;Operator notices&quot;. Archiving removes a notice from
          the public page but keeps it in the database so you can restore it.
        </p>

        <Form method="post" className="mt-6 space-y-3">
          <input type="hidden" name="intent" value="create-incident" />
          <label className="block text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Title</span>
            <input
              name="title"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Report</span>
            <textarea
              name="body"
              required
              rows={6}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Severity</span>
            <select
              name="severity"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            >
              {MANUAL_INCIDENT_SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {monitors.length > 0 ? (
            <fieldset>
              <legend className="text-sm text-zinc-600 dark:text-zinc-400">
                Related monitors (optional)
              </legend>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {monitors.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200"
                  >
                    <input
                      type="checkbox"
                      name="affectedTargets"
                      value={m.id}
                      className="rounded border-zinc-300 dark:border-zinc-600"
                    />
                    {m.name}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Publish report
          </button>
        </Form>

        <details className="mt-8 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Import notice with historical times (recovery)
          </summary>
          <div className="border-t border-zinc-200 px-4 pb-4 pt-3 dark:border-zinc-700">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Inserts one MongoDB document with your timestamps and optional update
              entry. Does <strong>not</strong> send subscriber emails. Use ISO 8601
              UTC (e.g. <code className="font-mono">2026-04-06T19:30:00.000Z</code>
              ).
            </p>
            <Form method="post" className="mt-4 space-y-3">
              <input type="hidden" name="intent" value="import-incident-timeline" />
              <label className="block text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Title</span>
                <input
                  name="importTitle"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Report body</span>
                <textarea
                  name="importBody"
                  required
                  rows={8}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Current severity (stored on notice)
                </span>
                <select
                  name="importSeverity"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                >
                  {MANUAL_INCIDENT_SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Original author email
                </span>
                <input
                  name="noticeAuthorEmail"
                  type="email"
                  placeholder="felix.schultz@intastellar.com"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                />
              </label>
              <p className="text-xs text-zinc-500">
                Leave author blank to use your signed-in address (
                <span className="font-mono">{email}</span>).
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Created at (UTC)
                  </span>
                  <input
                    name="importCreatedAt"
                    required
                    placeholder="2026-04-06T19:30:00.000Z"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Resolved at (UTC, if severity is resolved)
                  </span>
                  <input
                    name="importResolvedAt"
                    placeholder="2026-04-06T19:52:00.000Z"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
                  />
                </label>
              </div>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Optional timeline update (e.g. status change + message)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Update at (UTC)
                  </span>
                  <input
                    name="importUpdateAt"
                    placeholder="2026-04-06T19:52:00.000Z"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">From severity</span>
                  <select
                    name="importUpdateFromSeverity"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                  >
                    <option value="">—</option>
                    {MANUAL_INCIDENT_SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">To severity</span>
                  <select
                    name="importUpdateToSeverity"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                  >
                    <option value="">—</option>
                    {MANUAL_INCIDENT_SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Update author email (optional)
                </span>
                <input
                  name="importUpdateAuthorEmail"
                  type="email"
                  placeholder="felix.schultz@intastellar.com"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Update message
                </span>
                <textarea
                  name="importUpdateMessage"
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                />
              </label>
              {monitors.length > 0 ? (
                <fieldset>
                  <legend className="text-sm text-zinc-600 dark:text-zinc-400">
                    Related monitors (optional)
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                    {monitors.map((m) => (
                      <label
                        key={m.id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200"
                      >
                        <input
                          type="checkbox"
                          name="importAffectedTargets"
                          value={m.id}
                          className="rounded border-zinc-300 dark:border-zinc-600"
                        />
                        {m.name}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                Import to MongoDB
              </button>
            </Form>
          </div>
        </details>

        {incidents.length > 0 ? (
          <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-700">
            {incidents.map((ev) => (
              <li
                key={ev.id}
                className={`flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between ${
                  ev.archived
                    ? "rounded-lg bg-zinc-50 dark:bg-zinc-900/80"
                    : ""
                }`}
              >
                <div className="min-w-0">
                  {ev.archived ? (
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Archived — hidden from public status
                    </p>
                  ) : null}
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {ev.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {ev.body}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {ev.severity} · {ev.createdAt}
                    {ev.archived && ev.archivedAt ? (
                      <> · archived {ev.archivedAt}</>
                    ) : null}
                  </p>
                  {ev.affectedTargetIds?.length ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      Monitors:{" "}
                      {labelsForMonitorIds(ev.affectedTargetIds, monitors)}
                    </p>
                  ) : null}
                  {ev.updatesCount > 0 ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      {ev.updatesCount} update{ev.updatesCount === 1 ? "" : "s"} on record
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end sm:min-w-[220px]">
                  {ev.archived ? (
                    <Form
                      method="post"
                      onSubmit={(e) => {
                        if (
                          !confirm(
                            "Restore this operator notice to the public status page?",
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="intent" value="restore-incident" />
                      <input type="hidden" name="incidentId" value={ev.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                      >
                        Restore to status page
                      </button>
                    </Form>
                  ) : (
                    <>
                      <Form
                        method="post"
                        className="flex w-full flex-col gap-2"
                      >
                        <input
                          type="hidden"
                          name="intent"
                          value="update-incident-severity"
                        />
                        <input type="hidden" name="incidentId" value={ev.id} />
                        <label className="flex flex-col gap-1 text-xs text-zinc-500">
                          <span className="sr-only">Status</span>
                          <select
                            name="severity"
                            defaultValue={ev.severity}
                            className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                          >
                            {MANUAL_INCIDENT_SEVERITIES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex flex-col gap-1 text-xs text-zinc-500">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Update message (optional)
                          </span>
                          <textarea
                            name="updateMessage"
                            rows={3}
                            placeholder="What changed?"
                            className="w-full resize-y rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                          />
                        </label>
                        <button
                          type="submit"
                          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                        >
                          Update status
                        </button>
                      </Form>
                      <Form
                        method="post"
                        onSubmit={(e) => {
                          if (
                            !confirm(
                              "Remove this operator notice from the public status page? It will be archived here so you can restore it later.",
                            )
                          ) {
                            e.preventDefault();
                            return;
                          }
                          if (
                            !confirm(
                              "Second step: archive this notice? (It will no longer appear on /status.)",
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="intent" value="archive-incident" />
                        <input
                          type="hidden"
                          name="incidentId"
                          value={ev.id}
                        />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:underline dark:text-red-400"
                        >
                          Archive
                        </button>
                      </Form>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-zinc-500">No manual reports yet.</p>
        )}
      </section>
    </div>
  );
}
