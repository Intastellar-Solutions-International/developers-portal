import { redirect } from "react-router";

import type { Route } from "./+types/consents.changelog";

export function loader(_: Route.LoaderArgs) {
  return redirect("/changelog", 308);
}

export default function ConsentsChangelogRedirect() {
  return null;
}
