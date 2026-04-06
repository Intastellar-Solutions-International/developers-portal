import { useEffect, useState } from "react";
import { Link } from "react-router";

import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { useI18n } from "~/providers/i18n-provider";

const linkClass =
  "text-zinc-600 transition-colors hover:text-brand dark:text-zinc-400 dark:hover:text-brand";

type StatusJson = {
  snapshot: {
    overallOk: boolean;
    checkedAt: string;
  } | null;
};

/**
 * Footer link to `/status` with a small indicator from `/api/status.json`.
 */
export function StatusFooterLink() {
  const { t, locale } = useI18n();
  const [snapshot, setSnapshot] = useState<StatusJson["snapshot"] | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/status.json")
      .then((r) => r.json() as Promise<StatusJson>)
      .then((j) => {
        if (!cancelled) setSnapshot(j.snapshot);
      })
      .catch(() => {
        if (!cancelled) setSnapshot(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dotClass =
    snapshot === undefined
      ? "bg-zinc-400"
      : snapshot === null
        ? "bg-zinc-400"
        : snapshot.overallOk
          ? "bg-emerald-500"
          : "bg-red-500";

  return (
    <Link
      to={withLocalePrefix("/status", locale)}
      className={`${linkClass} inline-flex items-center gap-1.5`}
      title={
        snapshot && !snapshot.overallOk
          ? t("footer.statusDegraded")
          : t("footer.statusOk")
      }
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${dotClass}`}
        aria-hidden
      />
      {t("footer.statusOk")}
    </Link>
  );
}
