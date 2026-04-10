import { IntaConsentTryout } from "~/components/inta-consent-tryout";
import { MdxContent } from "~/components/mdx-content";

type Props = {
  tryout: boolean;
  title: string;
  description?: string;
  code: string;
  previewOrigin: string;
  previewHostname: string;
};

/**
 * Doc body: normal pages render MDX; cookie-banner try-out renders the interactive UI (MDX body is empty).
 */
export function CookieBannerTryoutDocBody({
  tryout,
  title,
  description,
  code,
  previewOrigin,
  previewHostname,
}: Props) {
  if (!tryout) {
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
