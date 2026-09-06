import { Link } from "react-router";

import { DevelopersBrandLogo } from "~/components/developers-brand-logo";
import { StatusFooterLink } from "~/components/status-footer-link";
import { docHref, getDefaultVersionSlug } from "~/lib/docs-versions";
import { withLocalePrefix } from "~/lib/i18n/localized-path";
import { useI18n } from "~/providers/i18n-provider";
import { CORPORATE_LEGAL } from "~/lib/legal-links";
import { requestOpenSearch } from "~/lib/search-overlay-context";

const linkClass =
  "text-zinc-600 transition-colors hover:text-brand dark:text-zinc-400 dark:hover:text-brand";

const headingClass =
  "text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500";

export function SiteFooter() {
  const { t, locale } = useI18n();
  const lp = (path: string) => withLocalePrefix(path, locale);
  const year = new Date().getFullYear();
  const vCb = getDefaultVersionSlug("cookie-banner");
  const vAcc = getDefaultVersionSlug("accounts-sign-in");
  const vAna = getDefaultVersionSlug("analytics");

  return (
    <footer
      className="border-t border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
      role="contentinfo"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to={lp("/")}
              className="inline-block transition-opacity hover:opacity-90"
              title={t("nav.logoHomeTitle")}
            >
              <DevelopersBrandLogo variant="footer" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t("footer.tagline")}
            </p>
          </div>
          <div>
            <p className={headingClass}>{t("footer.documentation")}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to={lp("/docs")} className={linkClass}>
                  {t("footer.allDocs")}
                </Link>
              </li>
              <li>
                <Link
                  to={docHref(locale, "cookie-banner", vCb)}
                  className={linkClass}
                >
                  {t("footer.intastellarConsents")}
                </Link>
              </li>
              <li>
                <Link
                  to={docHref(locale, "analytics", vAna)}
                  className={linkClass}
                >
                  {t("footer.intastellarAnalytics")}
                </Link>
              </li>
              <li>
                <Link
                  to={docHref(locale, "accounts-sign-in", vAcc)}
                  className={linkClass}
                >
                  {t("footer.accountsSignIn")}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => requestOpenSearch()}
                  className={`${linkClass} text-left`}
                >
                  {t("footer.searchDocs")}
                  <span className="ml-1 text-zinc-500 dark:text-zinc-600" aria-hidden>
                    ⌘K
                  </span>
                </button>
              </li>
            </ul>
          </div>
          <div>
            <p className={headingClass}>{t("footer.platform")}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to={lp("/")} className={linkClass}>
                  {t("footer.home")}
                </Link>
              </li>
              <li>
                <Link to={lp("/changelog")} className={linkClass}>
                  {t("footer.changelog")}
                </Link>
              </li>
              <li>
                <StatusFooterLink />
              </li>
              <li>
                <Link to={lp("/account/login")} className={linkClass}>
                  {t("footer.signIn")}
                </Link>
              </li>
              <li>
                <Link to={lp("/account/api-keys")} className={linkClass}>
                  {t("footer.apiKeys")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className={headingClass}>{t("footer.legal")}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to={lp("/legal")} className={linkClass}>
                  {t("footer.legalOverview")}
                </Link>
              </li>
              <li>
                <Link to={lp("/legal/privacy")} className={linkClass}>
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link to={lp("/legal/terms")} className={linkClass}>
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <a
                  href={CORPORATE_LEGAL.dpa}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={linkClass}
                >
                  {t("footer.dpaCorporate")}
                  <span className="ml-0.5 text-xs opacity-70" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className={headingClass}>{t("footer.intastellar")}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="https://www.intastellarsolutions.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={linkClass}
                >
                  {t("footer.intastellarSolutions")}
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
                  {t("footer.cookieConsentsProduct")}
                  <span className="ml-0.5 text-xs opacity-70" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-zinc-200 pt-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
          {t("footer.copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
