import { NavLink, Outlet } from "react-router";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium",
    isActive
      ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
  ].join(" ");

export default function AccountLayout() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Account
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Developer profile and API keys (connect your auth provider here).
      </p>
      <div className="mt-8 flex gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <NavLink to="/account/profile" className={tabClass}>
          Profile
        </NavLink>
        <NavLink to="/account/api-keys" className={tabClass}>
          API keys
        </NavLink>
      </div>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
