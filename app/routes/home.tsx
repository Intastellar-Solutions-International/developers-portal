import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { DEFAULT_LOCALE, isLocale } from "~/lib/i18n/locale";
import { buildHomePageMeta } from "~/lib/seo";
import type { RootLoaderData } from "~/providers/intastellar-auth-provider";

export function meta({ location, matches }: Route.MetaArgs) {
  let root: RootLoaderData | undefined;
  for (const m of matches) {
    if (m?.id === "root") {
      root = m.data as RootLoaderData;
      break;
    }
  }
  const locale = root != null && isLocale(root.locale) ? root.locale : DEFAULT_LOCALE;
  return buildHomePageMeta(location.pathname, locale);
}

export default function Home() {
  return <Welcome />;
}
