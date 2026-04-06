import { NavLink, Outlet } from "react-router";

import type { Route } from "./+types/legal";
import { CORPORATE_LEGAL } from "~/lib/legal-links";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { useI18n } from "~/providers/i18n-provider";

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    "transition-colors",
    isActive
      ? "font-medium text-brand dark:text-brand"
      : "text-zinc-600 hover:text-brand dark:text-zinc-400 dark:hover:text-brand",
  ].join(" ");

export default function LegalLayout(_: Route.ComponentProps) {
  const { locale } = useI18n();
  const lp = (path: string) => withLocalePrefix(path, locale);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Legal
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Policies for the inta.dev developer portal. Company-wide agreements and
        processor terms are published on{" "}
        <a
          href="https://www.intastellarsolutions.com"
          className="text-brand hover:text-brand-hover"
          target="_blank"
          rel="noreferrer noopener"
        >
          intastellarsolutions.com
        </a>
        .
      </p>
      <nav
        className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-zinc-200 pb-4 text-sm dark:border-zinc-700"
        aria-label="Legal sections"
      >
        <NavLink to={lp("/legal")} end className={navClass}>
          Overview
        </NavLink>
        <NavLink to={lp("/legal/privacy")} className={navClass}>
          Privacy
        </NavLink>
        <NavLink to={lp("/legal/terms")} className={navClass}>
          Terms
        </NavLink>
        <a
          href={CORPORATE_LEGAL.dpa}
          className="text-zinc-600 transition-colors hover:text-brand dark:text-zinc-400 dark:hover:text-brand"
          target="_blank"
          rel="noreferrer noopener"
        >
          Data Processing Agreement (DPA) ↗
        </a>
      </nav>
      <div className="mt-10">
        <Outlet />
      </div>
    </div>
  );
}
