import { Link, NavLink } from "react-router";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
  ].join(" ");

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4">
        <Link
          to="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          inta.dev
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/docs" className={linkClass}>
            Docs
          </NavLink>
          <NavLink to="/account/profile" className={linkClass}>
            Profile
          </NavLink>
          <NavLink to="/account/api-keys" className={linkClass}>
            API keys
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
