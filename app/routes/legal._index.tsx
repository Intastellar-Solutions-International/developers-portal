import { Link } from "react-router";

import type { Route } from "./+types/legal._index";
import { CORPORATE_LEGAL } from "~/lib/legal-links";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Legal · inta.dev" },
    {
      name: "description",
      content:
        "Legal information for inta.dev: privacy, terms, and links to Intastellar Solutions policies and DPA.",
    },
  ];
}

const ext =
  "text-brand hover:text-brand-hover underline-offset-2 hover:underline";

export default function LegalIndex() {
  return (
    <div className="space-y-10 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          About these pages
        </h2>
        <p className="mt-2">
          <strong className="font-medium text-zinc-800 dark:text-zinc-200">
            inta.dev
          </strong>{" "}
          is the developer portal for Intastellar products (documentation, search,
          changelog, and optional Intastellar Accounts sign-in). The policies below
          describe this site. Intastellar’s company-wide legal documents apply in
          addition where referenced.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          inta.dev
        </h2>
        <ul className="mt-4 list-inside list-disc space-y-2 marker:text-brand">
          <li>
            <Link to="/legal/privacy" className={ext}>
              Privacy policy
            </Link>{" "}
            — cookies, analytics (Google Tag Manager / GA4), Consents via GTM, and
            account data on this domain.
          </li>
          <li>
            <Link to="/legal/terms" className={ext}>
              Terms of use
            </Link>{" "}
            — acceptable use of the developer portal and linked services.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Intastellar Solutions (corporate)
        </h2>
        <ul className="mt-4 list-inside list-disc space-y-2 marker:text-brand">
          <li>
            <a
              href={CORPORATE_LEGAL.dpa}
              className={ext}
              target="_blank"
              rel="noreferrer noopener"
            >
              Data Processing Agreement (DPA)
            </a>
            — governs processing when Intastellar acts as a processor for
            customers using services such as Intastellar Consents.
          </li>
          <li>
            <a
              href={CORPORATE_LEGAL.privacyPolicy}
              className={ext}
              target="_blank"
              rel="noreferrer noopener"
            >
              Privacy policy
            </a>
          </li>
          <li>
            <a
              href={CORPORATE_LEGAL.termsOfUse}
              className={ext}
              target="_blank"
              rel="noreferrer noopener"
            >
              Terms of use
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
