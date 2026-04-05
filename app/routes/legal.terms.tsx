import { Link } from "react-router";

import type { Route } from "./+types/legal.terms";
import { CORPORATE_LEGAL } from "~/lib/legal-links";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Terms of use · inta.dev" },
    {
      name: "description",
      content:
        "Terms of use for the inta.dev developer portal, documentation, and account features.",
    },
  ];
}

const h2 =
  "mt-10 text-base font-semibold text-zinc-900 dark:text-zinc-50 first:mt-0";
const p = "mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300";
const ul = "mt-3 list-inside list-disc space-y-2 text-sm text-zinc-700 marker:text-brand dark:text-zinc-300";
const a =
  "text-brand underline-offset-2 hover:text-brand-hover hover:underline";

export default function LegalTerms() {
  return (
    <article>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Terms of use — inta.dev
      </h2>
      <p className={`${p} text-zinc-600 dark:text-zinc-400`}>
        <strong className="text-zinc-800 dark:text-zinc-200">Effective:</strong>{" "}
        April 2026. These terms govern your use of the developer portal at{" "}
        <strong className="text-zinc-800 dark:text-zinc-200">inta.dev</strong>.
        Intastellar’s{" "}
        <a
          href={CORPORATE_LEGAL.termsOfUse}
          className={a}
          target="_blank"
          rel="noreferrer noopener"
        >
          general terms of use
        </a>{" "}
        continue to apply where they do not conflict with this page. For
        processing of personal data, see our{" "}
        <Link to="/legal/privacy" className={a}>
          privacy policy
        </Link>{" "}
        and the{" "}
        <a href={CORPORATE_LEGAL.dpa} className={a} target="_blank" rel="noreferrer noopener">
          DPA
        </a>{" "}
        where Intastellar acts as a processor for your organisation.
      </p>

      <h3 className={h2}>The service</h3>
      <p className={p}>
        inta.dev provides access to technical documentation, search, the Intastellar
        Consents changelog, and optional account tools (such as profile and API keys)
        subject to configuration and availability. We may change or discontinue
        features with reasonable notice where practicable.
      </p>

      <h3 className={h2}>Acceptable use</h3>
      <ul className={ul}>
        <li>
          Do not attempt to disrupt, overload, or bypass security of the site or
          related systems.
        </li>
        <li>
          Do not use automated access in a way that impairs service for others
          (for example aggressive scraping contrary to robots rules or our
          instructions).
        </li>
        <li>
          Documentation and examples are provided “as is” for integration
          guidance; you remain responsible for your own applications and compliance
          with applicable law.
        </li>
      </ul>

      <h3 className={h2}>Accounts</h3>
      <p className={p}>
        Where sign-in is enabled, you must keep credentials confidential and
        notify us of suspected misuse. Account use is also subject to Intastellar
        Accounts policies communicated at sign-in.
      </p>

      <h3 className={h2}>Intellectual property</h3>
      <p className={p}>
        Content on inta.dev is owned by Intastellar or its licensors. You may copy
        short excerpts (for example code snippets) for implementation in your
        projects as reasonably needed; redistribution of large parts of the docs
        or misleading attribution is not allowed.
      </p>

      <h3 className={h2}>Disclaimer and liability</h3>
      <p className={p}>
        The site and docs are provided without warranties to the extent permitted
        by law. To the extent permitted, Intastellar’s liability for use of the
        free public portal is limited as set out in our corporate terms, except
        where mandatory law provides otherwise.
      </p>

      <h3 className={h2}>Governing law</h3>
      <p className={p}>
        These terms are governed by{" "}
        <strong className="text-zinc-800 dark:text-zinc-200">Danish law</strong>,
        without prejudice to mandatory consumer protections where they apply.
      </p>

      <h3 className={h2}>Contact</h3>
      <p className={p}>
        Questions about these terms:{" "}
        <a href="mailto:privacy@intastellar.com" className={a}>
          privacy@intastellar.com
        </a>
        .
      </p>
    </article>
  );
}
