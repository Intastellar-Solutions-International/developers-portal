import { Link, NavLink } from "react-router";

import { BRAND } from "~/lib/brand";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-white/15 text-white"
      : "text-zinc-400 hover:bg-white/10 hover:text-white",
  ].join(" ");

export function SiteHeader() {
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
          <NavLink to="/docs" className={navLinkClass}>
            Docs
          </NavLink>
          <NavLink to="/account/profile" className={navLinkClass}>
            Profile
          </NavLink>
          <NavLink to="/account/api-keys" className={navLinkClass}>
            API keys
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
