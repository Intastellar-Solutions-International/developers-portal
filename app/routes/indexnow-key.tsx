import { data } from "react-router";

import type { Route } from "./+types/indexnow-key";
import { isValidIndexNowKey } from "~/lib/indexnow.server";

const KEY_FILE_SEGMENT_RE = /^[a-zA-Z0-9-]{8,128}\.txt$/;

export async function loader({ params }: Route.LoaderArgs) {
  const segment = params.indexnowKey ?? "";
  const expected = process.env.INDEXNOW_KEY?.trim();

  if (!isValidIndexNowKey(expected)) {
    throw data(null, { status: 404 });
  }

  if (!KEY_FILE_SEGMENT_RE.test(segment)) {
    throw data(null, { status: 404 });
  }

  const keyFromPath = segment.slice(0, -4);
  if (keyFromPath !== expected) {
    throw data(null, { status: 404 });
  }

  return new Response(expected, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
