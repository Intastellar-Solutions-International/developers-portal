import { Link, NavLink } from "react-router";

import { BRAND } from "~/lib/brand";
import { useIntastellarAuth } from "~/providers/intastellar-auth-provider";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-brand/20 text-brand"
      : "text-zinc-400 hover:bg-white/10 hover:text-brand",
  ].join(" ");

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

const headerBtnClass =
  "rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50";

export function SiteHeader({
  onOpenSearch,
}: {
  onOpenSearch: () => void;
}) {
  const { configured, isLoading, isSignedIn, users, signin, logout } =
    useIntastellarAuth();
  const user = users[0];

  return (
    <header className="border-b border-zinc-600/40 bg-zinc-800">
      <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <a
            href="https://www.intastellarsolutions.com"
            target="_blank"
            rel="noreferrer noopener"
            className="shrink-0 opacity-90 transition-opacity hover:opacity-100"
            title="Intastellar Solutions"
          >
            <img
              src={BRAND.companyLogoBlack}
              alt="Intastellar Solutions"
              className="h-6 w-auto brightness-0 invert sm:h-7"
            />
          </a>
          <span
            className="hidden h-6 w-px shrink-0 bg-white/20 sm:block"
            aria-hidden
          />
          <Link
            to="/"
            className="min-w-0 shrink-0 transition-opacity hover:opacity-90"
            title="Intastellar Developers"
          >
            <img
              src={BRAND.developersLogoWhite}
              alt="Intastellar Developers"
              className="h-7 w-auto max-w-[9rem] object-left object-contain sm:h-8 sm:max-w-none"
            />
          </Link>
          <span
            className="hidden h-6 w-px shrink-0 bg-white/20 md:block"
            aria-hidden
          />
          <Link
            to="/docs/cookie-banner"
            className="hidden min-w-0 shrink-0 transition-opacity hover:opacity-90 md:block"
            title="Intastellar Consents documentation"
          >
            <img
              src={BRAND.consentsProductLogoWhite}
              alt="Intastellar Consents"
              className="h-6 w-auto max-w-[10rem] object-left object-contain sm:h-7"
            />
          </Link>
        </div>
        <nav className="flex shrink-0 flex-wrap items-center justify-end gap-0.5 sm:gap-1">
          <NavLink to="/changelog" className={navLinkClass}>
            Changelog
          </NavLink>
          <NavLink to="/docs" className={navLinkClass}>
            Docs
          </NavLink>
          {configured && !isSignedIn ? (
            <button
              type="button"
              className={headerBtnClass}
              disabled={isLoading}
              onClick={() => void signin()}
            >
              {isLoading ? "…" : "Sign in"}
            </button>
          ) : null}
          {configured && isSignedIn && user ? (
            <>
              <span
                className="hidden max-w-[7rem] truncate px-2 text-xs text-zinc-500 sm:inline md:max-w-[10rem]"
                title={user.email}
              >
                {user.name.first}
              </span>
              <button type="button" className={headerBtnClass} onClick={logout}>
                Sign out
              </button>
            </>
          ) : null}
          <NavLink to="/account/profile" className={navLinkClass}>
            Profile
          </NavLink>
          <NavLink to="/account/api-keys" className={navLinkClass}>
            API keys
          </NavLink>
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search documentation"
            title="Search (⌘K)"
            className="rounded-md p-2.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-brand"
          >
            <SearchIcon className="size-5" />
          </button>
        </nav>
      </div>
    </header>
  );
}
