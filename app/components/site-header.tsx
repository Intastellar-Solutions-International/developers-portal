import { useEffect, useId, useState } from "react";
import { Link, NavLink, useLocation, useRouteLoaderData } from "react-router";

import { BRAND } from "~/lib/brand";
import { docHref, getDefaultVersionSlug } from "~/lib/docs-versions";
import {
  type RootLoaderData,
  useIntastellarAuth,
} from "~/providers/intastellar-auth-provider";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-brand/20 text-brand"
      : "text-zinc-400 hover:bg-white/10 hover:text-brand",
  ].join(" ");

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex w-full items-center rounded-lg px-4 py-3 text-base font-medium transition-colors",
    isActive
      ? "bg-brand/20 text-brand"
      : "text-zinc-200 hover:bg-white/10 hover:text-brand",
  ].join(" ");

const headerBtnClass =
  "rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50";

const mobileHeaderBtnClass =
  "flex w-full items-center justify-center rounded-lg px-4 py-3 text-base font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50";

type PortalAccount = NonNullable<RootLoaderData["portalAccount"]>;

function splitPortalDisplayName(displayName: string): { first: string; last: string } {
  const t = displayName.trim();
  const i = t.indexOf(" ");
  if (i === -1) return { first: t || "Member", last: "" };
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() };
}

function portalSessionInitials(account: PortalAccount): string {
  const { first, last } = splitPortalDisplayName(account.displayName);
  const a = first[0];
  const b = last[0];
  const pair = `${a ?? ""}${b ?? ""}`.toUpperCase();
  if (pair) return pair;
  const e = account.email.trim()[0];
  return e ? e.toUpperCase() : "?";
}

function HeaderSessionAvatar({
  account,
  className = "h-8 w-8",
}: {
  account: PortalAccount;
  className?: string;
}) {
  const src = account.avatarUrl?.trim();
  return (
    <span
      className={`flex shrink-0 overflow-hidden rounded-full bg-zinc-600 ring-2 ring-white/15 ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center text-[0.65rem] font-semibold leading-none text-zinc-100 sm:text-xs"
          aria-hidden
        >
          {portalSessionInitials(account)}
        </span>
      )}
    </span>
  );
}

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

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function SiteHeader({
  onOpenSearch,
}: {
  onOpenSearch: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuTitleId = useId();
  const { authReady, configured, isLoading, signin, logout } = useIntastellarAuth();
  const rootLoaderData = useRouteLoaderData("root") as RootLoaderData | undefined;
  const portalAccount = rootLoaderData?.portalAccount ?? null;
  const hasPortalSession = Boolean(portalAccount?.email?.trim());

  const consentsDocsHref = docHref(
    "cookie-banner",
    getDefaultVersionSlug("cookie-banner"),
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-600/40 bg-zinc-800">
      <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
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
            className="hidden h-6 w-px shrink-0 bg-white/20 lg:block"
            aria-hidden
          />
          <Link
            to={consentsDocsHref}
            className="hidden min-w-0 shrink-0 transition-opacity hover:opacity-90 lg:block"
            title="Intastellar Consents documentation"
          >
            <img
              src={BRAND.consentsProductLogoWhite}
              alt="Intastellar Consents"
              className="h-6 w-auto max-w-[10rem] object-left object-contain sm:h-7"
            />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search documentation"
            title="Search (⌘K)"
            className="rounded-md p-2.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-brand"
          >
            <SearchIcon className="size-5" />
          </button>
          <button
            type="button"
            className="rounded-md p-2.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-brand lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuTitleId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <CloseIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>

          <nav
            className="hidden items-center gap-0.5 lg:flex lg:gap-1"
            aria-label="Main"
          >
            <NavLink
              to="/consents/changelog"
              className={navLinkClass}
              title="Intastellar Consents — releases & versions"
            >
              Consents changelog
            </NavLink>
            <NavLink to="/docs" className={navLinkClass}>
              Docs
            </NavLink>
            <NavLink to="/account/api-keys" className={navLinkClass}>
              API keys
            </NavLink>
            {authReady && configured && !hasPortalSession ? (
              <button
                type="button"
                className={headerBtnClass}
                disabled={isLoading}
                onClick={() => void signin()}
              >
                {isLoading ? "…" : "Sign in"}
              </button>
            ) : null}
            {authReady && configured && hasPortalSession && portalAccount ? (
              <>
                <Link
                  to="/account/profile"
                  className="flex max-w-[11rem] items-center gap-2 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-white/10"
                  title={portalAccount.email}
                >
                  <HeaderSessionAvatar account={portalAccount} />
                  <span className="hidden min-w-0 truncate text-sm text-zinc-300 xl:inline">
                    {splitPortalDisplayName(portalAccount.displayName).first}
                  </span>
                </Link>
                <button
                  type="button"
                  className={headerBtnClass}
                  onClick={() => void logout()}
                >
                  Sign out
                </button>
              </>
            ) : null}

          </nav>
        </div>
      </div>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-[90] lg:hidden"
          role="presentation"
          onClick={() => setMenuOpen(false)}
        >
          <div
            id={menuTitleId}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-y-0 right-0 flex w-[min(20rem,calc(100vw-1rem))] flex-col border-l border-zinc-600 bg-zinc-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-600/80 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-100">Menu</p>
              <button
                type="button"
                className="rounded-md p-2 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
            <nav
              className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
              aria-label="Main navigation"
            >
              <NavLink
                to="/consents/changelog"
                className={mobileNavLinkClass}
                title="Intastellar Consents — releases & versions"
                onClick={() => setMenuOpen(false)}
              >
                Consents changelog
              </NavLink>
              <NavLink
                to="/docs"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                Documentation
              </NavLink>
              <NavLink
                to={consentsDocsHref}
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                Intastellar Consents
              </NavLink>
              <NavLink
                to="/account/profile"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </NavLink>
              <NavLink
                to="/account/api-keys"
                className={mobileNavLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                API keys
              </NavLink>
            </nav>
            <div className="border-t border-zinc-600/80 p-3">
              {authReady && configured && !hasPortalSession ? (
                <button
                  type="button"
                  className={mobileHeaderBtnClass}
                  disabled={isLoading}
                  onClick={() => {
                    setMenuOpen(false);
                    void signin();
                  }}
                >
                  {isLoading ? "Signing in…" : "Sign in"}
                </button>
              ) : null}
              {authReady && configured && hasPortalSession && portalAccount ? (
                <div className="space-y-2">
                  <Link
                    to="/account/profile"
                    className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-white/5"
                    onClick={() => setMenuOpen(false)}
                  >
                    <HeaderSessionAvatar account={portalAccount} className="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {splitPortalDisplayName(portalAccount.displayName).first}
                      </p>
                      <p
                        className="mt-0.5 truncate text-xs text-zinc-500"
                        title={portalAccount.email}
                      >
                        {portalAccount.email}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    className={mobileHeaderBtnClass}
                    onClick={() => {
                      setMenuOpen(false);
                      void logout();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
              <a
                href="https://www.intastellarsolutions.com"
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 flex w-full items-center justify-center rounded-lg px-4 py-3 text-base font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-brand"
                onClick={() => setMenuOpen(false)}
              >
                Intastellar Solutions
                <span className="ml-1 text-xs opacity-70" aria-hidden>
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
