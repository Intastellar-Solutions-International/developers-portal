import type { StatusDeployPublic } from "~/lib/status-deploy.server";
import type { StatusMaintenanceWindowPublic } from "~/lib/status-maintenance.server";
import { interpolate } from "~/lib/i18n/messages";
import type { StatusPageCopy } from "~/lib/status-page-copy";

export function StatusTrustSection({ copy }: { copy: StatusPageCopy }) {
  return (
    <section
      className="mt-8 rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900/40"
      aria-labelledby="status-trust-heading"
    >
      <h2
        id="status-trust-heading"
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {copy.trustHeading}
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        {copy.trustIntro}
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>{copy.trustBulletSynthetic}</li>
        <li>{copy.trustBulletFrequency}</li>
        <li>{copy.trustBulletPass}</li>
        <li>{copy.trustBulletHistory}</li>
        <li>{copy.trustBulletUtc}</li>
      </ul>
    </section>
  );
}

export function StatusMaintenanceSection({
  copy,
  windows,
}: {
  copy: StatusPageCopy;
  windows: StatusMaintenanceWindowPublic[];
}) {
  return (
    <section
      className="mt-6 rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900/40"
      aria-labelledby="status-maintenance-heading"
    >
      <h2
        id="status-maintenance-heading"
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {copy.maintenanceHeading}
      </h2>
      {windows.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {copy.maintenanceEmpty}
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {windows.map((w) => (
            <li
              key={w.id}
              className={`rounded-lg border px-4 py-3 ${
                w.phase === "active"
                  ? "border-amber-300/90 bg-amber-50/80 dark:border-amber-800/60 dark:bg-amber-950/35"
                  : "border-zinc-200 bg-zinc-50/60 dark:border-zinc-600 dark:bg-zinc-800/40"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${
                    w.phase === "active"
                      ? "bg-amber-200 text-amber-950 dark:bg-amber-900/80 dark:text-amber-100"
                      : "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100"
                  }`}
                >
                  {w.phase === "active"
                    ? copy.maintenanceActiveBadge
                    : copy.maintenanceUpcomingBadge}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {w.title}
                </span>
              </div>
              <p className="mt-1.5 font-mono text-[0.7rem] text-zinc-500 dark:text-zinc-400">
                {interpolate(copy.maintenanceRange, {
                  start: w.startsAtLabel,
                  end: w.endsAtLabel,
                })}
              </p>
              {w.summary ? (
                <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {w.summary}
                </p>
              ) : null}
              {w.affectedLabels.length > 0 ? (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium text-zinc-600 dark:text-zinc-300">
                    {copy.affectedMonitorsLabel}:{" "}
                  </span>
                  {w.affectedLabels.join(", ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function StatusDeploySection({
  copy,
  deploy,
}: {
  copy: StatusPageCopy;
  deploy: StatusDeployPublic | null;
}) {
  return (
    <section
      className="mt-6 rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900/40"
      aria-labelledby="status-deploy-heading"
    >
      <h2
        id="status-deploy-heading"
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {copy.deployHeading}
      </h2>
      {!deploy ? (
        <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {copy.deployUnavailable}
        </p>
      ) : (
        <div className="mt-3 space-y-3 text-xs">
          <div>
            <p className="font-medium text-zinc-500 dark:text-zinc-400">
              {copy.deployCommit}
            </p>
            <p className="mt-0.5 font-mono text-zinc-900 dark:text-zinc-100">
              {deploy.commitShort}
              {deploy.commitUrl ? (
                <>
                  {" · "}
                  <a
                    href={deploy.commitUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-brand hover:text-brand-hover"
                  >
                    {copy.deployViewCommit}
                  </a>
                </>
              ) : null}
            </p>
          </div>
          {deploy.commitRef ? (
            <div>
              <p className="font-medium text-zinc-500 dark:text-zinc-400">
                {copy.deployBranch}
              </p>
              <p className="mt-0.5 font-mono text-zinc-800 dark:text-zinc-200">
                {deploy.commitRef}
              </p>
            </div>
          ) : null}
          {deploy.commitMessage ? (
            <div>
              <p className="font-medium text-zinc-500 dark:text-zinc-400">
                {copy.deployMessage}
              </p>
              <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                {deploy.commitMessage}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
