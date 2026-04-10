import { useEffect, useState } from "react";

import { IntaConsentTryout } from "~/components/inta-consent-tryout";
import { MdxContent } from "~/components/mdx-content";

type Props = {
  title: string;
  description?: string;
  code: string;
  previewOrigin: string;
  previewHostname: string;
};

/**
 * Cookie-banner "Try out" doc: SSR + first client paint render MDX only so hydration always
 * matches. After mount, swap to the interactive preview (avoids loader-field / HMR skew).
 */
export function CookieBannerTryoutDocBody({
  title,
  description,
  code,
  previewOrigin,
  previewHostname,
}: Props) {
  const [interactive, setInteractive] = useState(false);
  useEffect(() => {
    setInteractive(true);
  }, []);

  if (!interactive) {
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
