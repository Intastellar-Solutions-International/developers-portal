import type { Route } from "./+types/legal.privacy";
import { CORPORATE_LEGAL } from "~/lib/legal-links";
import { translatePath } from "~/lib/i18n/messages";
import { resolveMetaLocale } from "~/lib/seo";

export function meta({ matches, location }: Route.MetaArgs) {
  const locale = resolveMetaLocale(matches, location.pathname);
  return [
    { title: translatePath(locale, "seo.legalPrivacyTitle") },
    {
      name: "description",
      content: translatePath(locale, "seo.legalPrivacyDescription"),
    },
  ];
}

const h2 =
  "mt-10 text-base font-semibold text-zinc-900 dark:text-zinc-50 first:mt-0";
const p = "mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300";
const ul = "mt-3 list-inside list-disc space-y-2 text-sm text-zinc-700 marker:text-brand dark:text-zinc-300";
const a =
  "text-brand underline-offset-2 hover:text-brand-hover hover:underline";

export default function LegalPrivacy() {
  return (
    <article>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Privacy policy — inta.dev
      </h2>
      <p className={`${p} text-zinc-600 dark:text-zinc-400`}>
        <strong className="text-zinc-800 dark:text-zinc-200">Effective:</strong>{" "}
        April 2026. This notice describes Intastellar Solutions’ processing of
        personal data in connection with the public developer site{" "}
        <strong className="text-zinc-800 dark:text-zinc-200">inta.dev</strong>.
        It should be read together with our{" "}
        <a
          href={CORPORATE_LEGAL.privacyPolicy}
          className={a}
          target="_blank"
          rel="noreferrer noopener"
        >
          company privacy policy
        </a>{" "}
        and, where Intastellar processes data on behalf of customers, the{" "}
        <a
          href={CORPORATE_LEGAL.dpa}
          className={a}
          target="_blank"
          rel="noreferrer noopener"
        >
          Data Processing Agreement (DPA)
        </a>
        .
      </p>

      <h3 className={h2}>Who is responsible?</h3>
      <p className={p}>
        <strong className="text-zinc-800 dark:text-zinc-200">
          Intastellar Solutions, International
        </strong>{" "}
        is the controller for personal data processed when you use inta.dev as
        described here. Contact for data protection:{" "}
        <a href="mailto:privacy@intastellar.com" className={a}>
          privacy@intastellar.com
        </a>
        .
      </p>

      <h3 className={h2}>What is inta.dev?</h3>
      <p className={p}>
        inta.dev hosts technical documentation, a search index over those docs, a
        changelog of Intastellar Consents releases, and optional sign-in via
        Intastellar Accounts to reach
        profile and API key pages. You can use most of the site without an account.
      </p>

      <h3 className={h2}>Intastellar Consents and Google Tag Manager</h3>
      <p className={p}>
        This site uses{" "}
        <strong className="text-zinc-800 dark:text-zinc-200">
          Intastellar Consents
        </strong>{" "}
        to collect and store cookie / similar technology preferences. Consents is{" "}
        <strong className="text-zinc-800 dark:text-zinc-200">
          loaded and configured through Google Tag Manager (GTM)
        </strong>
        : the banner and consent logic run as part of our tag setup so that
        measurement tags (for example Google Analytics) only fire in line with
        your choices. You can update preferences using the cookie controls
        presented on the site.
      </p>
      <p className={p}>
        We also use{" "}
        <strong className="text-zinc-800 dark:text-zinc-200">GTM</strong> to deploy
        and manage tags, including connection to{" "}
        <strong className="text-zinc-800 dark:text-zinc-200">
          Google Analytics 4
        </strong>{" "}
        for aggregated usage statistics. Details depend on your consent settings
        and tag configuration.
      </p>

      <h3 className={h2}>Categories of data</h3>
      <ul className={ul}>
        <li>
          <strong className="text-zinc-800 dark:text-zinc-200">Usage data:</strong>{" "}
          pages viewed, approximate location derived from IP (if collected by
          analytics tools), device/browser metadata, and events sent to analytics
          when permitted.
        </li>
        <li>
          <strong className="text-zinc-800 dark:text-zinc-200">
            Account data (if you sign in):
          </strong>{" "}
          identifiers and profile details provided by Intastellar Accounts (for
          example name and email) as needed to show your session and account
          pages.
        </li>
        <li>
          <strong className="text-zinc-800 dark:text-zinc-200">Technical logs:</strong>{" "}
          standard server or edge logs for security and reliability (for example IP
          address, timestamps, URLs) as processed by our hosting provider.
        </li>
      </ul>

      <h3 className={h2}>Purposes and legal bases (EEA/UK overview)</h3>
      <p className={p}>
        We process data to operate and secure the site, measure aggregate
        interest in documentation when you consent, and to perform sign-in and
        account features you request. Where GDPR applies, we rely on appropriate
        bases such as consent (non-essential cookies/analytics), contract or
        steps prior to contract (account features), and legitimate interests
        (security, core site delivery), balanced against your rights.
      </p>

      <h3 className={h2}>Processors and transfers</h3>
      <p className={p}>
        We use trusted service providers (for example hosting and, when you allow
        them, Google Tag Manager / Google Analytics). Some processing may occur
        outside your country; where required we use appropriate safeguards (such
        as Standard Contractual Clauses). Sub-processor information for customer
        services is described in our corporate documentation and{" "}
        <a href={CORPORATE_LEGAL.dpa} className={a} target="_blank" rel="noreferrer noopener">
          DPA
        </a>
        .
      </p>

      <h3 className={h2}>Retention</h3>
      <p className={p}>
        We keep information only as long as needed for the purposes above, unless
        a longer period is required by law. Analytics retention follows the
        settings of the relevant product; consent records are kept as required for
        compliance.
      </p>

      <h3 className={h2}>Your rights</h3>
      <p className={p}>
        Depending on your location, you may have rights to access, rectify, erase,
        restrict, or object to certain processing, and to lodge a complaint with a
        supervisory authority. To exercise rights, contact{" "}
        <a href="mailto:privacy@intastellar.com" className={a}>
          privacy@intastellar.com
        </a>
        . You can also use available browser controls and our cookie preferences.
      </p>

      <h3 className={h2}>Changes</h3>
      <p className={p}>
        We may update this page from time to time. Material changes will be
        reflected by updating the effective date and, where appropriate, a notice
        on the site.
      </p>
    </article>
  );
}
