import { useLayoutEffect, useState } from "react";

import { IntaConsentTryout } from "~/components/inta-consent-tryout";
import { MdxContent } from "~/components/mdx-content";

type Props = {
  /** When true, MDX is shown for SSR + first client paint, then the interactive tryout mounts (hydration-safe). */
  tryout: boolean;
  title: string;
  description?: string;
  code: string;
  previewOrigin: string;
  previewHostname: string;
};

/**
 * Single doc body entrypoint: plain MDX, or try-out page (minimal MDX first, then interactive UI).
 * The deferred swap avoids server vs client branching on loader/params during hydration.
 */
export function CookieBannerTryoutDocBody({
  tryout,
  title,
  description,
  code,
  previewOrigin,
  previewHostname,
}: Props) {
  const [tryoutReady, setTryoutReady] = useState(false);

  useLayoutEffect(() => {
    if (tryout) setTryoutReady(true);
  }, [tryout]);

  if (!tryout) {
    return <MdxContent code={code} />;
  }

  if (!tryoutReady) {
    return <MdxContent code={code} />;
  }

  return (
    <>
      <h1>{title}</h1>
      {description ? (
        <p className="lead text-zinc-600 dark:text-zinc-400">{description}</p>
      ) : null}
      <IntaConsentTryout previewOrigin={previewOrigin} previewHostname={previewHostname} />
    </>
  );
}
