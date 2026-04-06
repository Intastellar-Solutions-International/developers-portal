import { BRAND } from "~/lib/brand";

const imgClassHeader =
  "h-7 w-auto max-w-[11rem] object-left object-contain sm:h-8 sm:max-w-[13rem]";

const imgClassFooter =
  "h-8 w-auto max-w-[12rem] object-left object-contain sm:h-9 sm:max-w-[14rem]";

type DevelopersBrandLogoProps = {
  /** `header` matches the site header; `footer` is slightly larger for the footer column. */
  variant?: "header" | "footer";
  className?: string;
};

export function DevelopersBrandLogo({
  variant = "header",
  className = "",
}: DevelopersBrandLogoProps) {
  const base = variant === "footer" ? imgClassFooter : imgClassHeader;
  const extra = className.trim();
  const shared = extra ? `${base} ${extra}` : base;

  return (
    <>
      <img
        src={BRAND.developersLogoBlack}
        alt="Intastellar Developers"
        className={`${shared} dark:hidden`}
      />
      <img
        src={BRAND.developersLogoWhite}
        alt=""
        aria-hidden
        className={`hidden ${shared} dark:block`}
      />
    </>
  );
}
