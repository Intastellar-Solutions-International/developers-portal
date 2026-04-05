import { Link } from "react-router";

import { docHref, getDefaultVersionSlug } from "~/lib/docs-versions";
import { CORPORATE_LEGAL } from "~/lib/legal-links";
import { requestOpenSearch } from "~/lib/search-overlay-context";

const linkClass =
  "text-zinc-400 transition-colors hover:text-brand dark:text-zinc-400 dark:hover:text-brand";

const headingClass =
  "text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const vCb = getDefaultVersionSlug("cookie-banner");
  const vAcc = getDefaultVersionSlug("accounts-sign-in");

  return (
    <footer
      className="border-t border-zinc-800 bg-zinc-900 text-zinc-400"
      role="contentinfo"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-semibold text-zinc-100">inta.dev</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
              Documentation, API keys, and integration guides for Intastellar
              Consents and Intastellar Accounts.
            </p>
          </div>
          <div>
            <p className={headingClass}>Documentation</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/docs" className={linkClass}>
                  All docs
                </Link>
              </li>
              <li>
                <Link
                  to={docHref("cookie-banner", vCb)}
                  className={linkClass}
                >
                  Intastellar Consents
                </Link>
              </li>
              <li>
                <Link
                  to={docHref("accounts-sign-in", vAcc)}
                  className={linkClass}
                >
                  Accounts — Sign in
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => requestOpenSearch()}
                  className={`${linkClass} text-left`}
                >
                  Search docs
                  <span className="ml-1 text-zinc-600" aria-hidden>
                    ⌘K
                  </span>
                </button>
              </li>
            </ul>
          </div>
          <div>
            <p className={headingClass}>Platform</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/" className={linkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/consents/changelog" className={linkClass}>
                  Consents changelog
                </Link>
              </li>
              <li>
                <Link to="/account/login" className={linkClass}>
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/account/api-keys" className={linkClass}>
                  API keys
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className={headingClass}>Legal</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/legal" className={linkClass}>
                  Legal overview
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className={linkClass}>
                  Privacy (inta.dev)
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className={linkClass}>
                  Terms (inta.dev)
                </Link>
              </li>
              <li>
                <a
                  href={CORPORATE_LEGAL.dpa}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={linkClass}
                >
                  DPA (corporate)
                  <span className="ml-0.5 text-xs opacity-70" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className={headingClass}>Intastellar</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="https://www.intastellarsolutions.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={linkClass}
                >
                  Intastellar Solutions
                  <span className="ml-0.5 text-xs opacity-70" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.intastellarsolutions.com/solutions/cookie-consents"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={linkClass}
                >
                  Cookie consents product
                  <span className="ml-0.5 text-xs opacity-70" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-zinc-800 pt-8 text-center text-xs text-zinc-500">
          © {year} Intastellar Solutions. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
