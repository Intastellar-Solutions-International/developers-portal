import { useMatches, useRouteLoaderData } from "react-router";

import type { RootLoaderData } from "~/providers/intastellar-auth-provider";

/**
 * `useRouteLoaderData("root")` can be briefly undefined during hydration while `matches` still carries
 * root loader data — use this anywhere nested routes must match SSR (tabs, locale, banners).
 */
export function useResolvedRootLoaderData(): RootLoaderData | undefined {
  const fromRoute = useRouteLoaderData("root") as RootLoaderData | undefined;
  const matches = useMatches();
  if (fromRoute !== undefined) return fromRoute;
  const rootMatch = matches.find((m) => m.id === "root");
  return rootMatch?.loaderData as RootLoaderData | undefined;
}
