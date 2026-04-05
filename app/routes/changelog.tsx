import { redirect } from "react-router";

import type { Route } from "./+types/changelog";

export function loader(_: Route.LoaderArgs) {
  return redirect("/consents/changelog", 308);
}
