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
  deleteManualIncidentById,
  insertManualIncident,
  listManualIncidentsForAdmin,
  updateManualIncidentSeverity,
} from "~/lib/status-manual-incidents.server";
import {
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
  const incidents: IncidentAdminSerialized[] = incRows.map((e) => ({
    id: e._id.toHexString(),
    title: e.title,
    body: e.body,
    severity: e.severity,
    createdAt: e.createdAt.toISOString(),
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

  if (intent === "update-incident-severity") {
    const incidentId = String(fd.get("incidentId") ?? "").trim();
    const severityRaw = String(fd.get("severity") ?? "");
    if (!MANUAL_INCIDENT_SEVERITIES.includes(severityRaw as ManualIncidentSeverity)) {
      return data({ error: "Invalid severity." }, { status: 400 });
    }
    const severity = severityRaw as ManualIncidentSeverity;
    const upd = await updateManualIncidentSeverity({
      hexId: incidentId,
      severity,
    });
    if (!upd.ok) {
      return data({ error: upd.error }, { status: 400 });
    }
    return redirect("/internal/status-ops");
  }

  if (intent === "delete-incident") {
    const id = String(fd.get("incidentId") ?? "").trim();
    const ok = await deleteManualIncidentById(id);
    if (!ok) {
      return data({ error: "Could not delete incident." }, { status: 400 });
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
          page under &quot;Operator notices&quot;.
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

        {incidents.length > 0 ? (
          <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-700">
            {incidents.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {ev.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {ev.body}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {ev.severity} · {ev.createdAt}
                  </p>
                  {ev.affectedTargetIds?.length ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      Monitors:{" "}
                      {labelsForMonitorIds(ev.affectedTargetIds, monitors)}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                  <Form
                    method="post"
                    className="flex flex-col gap-2 sm:flex-row sm:items-center"
                  >
                    <input
                      type="hidden"
                      name="intent"
                      value="update-incident-severity"
                    />
                    <input type="hidden" name="incidentId" value={ev.id} />
                    <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:items-end">
                      <span className="sr-only">Status</span>
                      <select
                        name="severity"
                        defaultValue={ev.severity}
                        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                      >
                        {MANUAL_INCIDENT_SEVERITIES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    >
                      Update status
                    </button>
                  </Form>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete-incident" />
                    <input
                      type="hidden"
                      name="incidentId"
                      value={ev.id}
                    />
                    <button
                      type="submit"
                      className="text-sm text-red-600 hover:underline dark:text-red-400"
                    >
                      Delete
                    </button>
                  </Form>
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
