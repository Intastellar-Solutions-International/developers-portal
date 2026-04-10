import { data } from "react-router";

import type { Route } from "./+types/indexnow-well-known";
import { tryIndexNowKeyPlainTextResponse } from "~/lib/indexnow.server";

/** `GET /.well-known/indexnow/{INDEXNOW_KEY}.txt` — same body as `/{key}.txt` (optional mirror). */
export async function loader({ params }: Route.LoaderArgs) {
  const segment = params.indexnowWellKey ?? "";
  const res = tryIndexNowKeyPlainTextResponse(segment);
  if (!res) throw data(null, { status: 404 });
  return res;
}
