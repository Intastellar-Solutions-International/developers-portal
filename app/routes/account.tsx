import { NavLink, Outlet } from "react-router";

import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { useI18n } from "~/providers/i18n-provider";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-brand/15 text-brand dark:bg-brand/20 dark:text-brand"
      : "text-zinc-600 hover:text-brand dark:text-zinc-400 dark:hover:text-brand",
  ].join(" ");

export default function AccountLayout() {
  const { locale, t } = useI18n();
  const lp = (path: string) => withLocalePrefix(path, locale);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("account.layoutTitle")}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {t("account.layoutDescription")}
      </p>
      <div className="mt-8 flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-700">
        <NavLink to={lp("/account/login")} className={tabClass}>
          {t("nav.signIn")}
        </NavLink>
        <NavLink to={lp("/account/profile")} className={tabClass}>
          {t("nav.profile")}
        </NavLink>
        <NavLink to={lp("/account/api-keys")} className={tabClass}>
          {t("nav.apiKeys")}
        </NavLink>
      </div>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
