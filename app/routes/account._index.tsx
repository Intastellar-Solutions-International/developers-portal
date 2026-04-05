import { redirect } from "react-router";

import type { Route } from "./+types/account._index";

export function loader(_: Route.LoaderArgs) {
  return redirect("/account/profile");
}
