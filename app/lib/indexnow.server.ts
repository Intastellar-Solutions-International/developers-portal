import { absoluteUrl, siteOrigin } from "~/lib/site";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_REQUEST = 10_000;

/** IndexNow key: 8–128 chars, `a-z` `A-Z` `0-9` `-` only. */
const INDEXNOW_KEY_RE = /^[a-zA-Z0-9-]{8,128}$/;

/** Filename segment `{key}.txt` for key file routes (root or `/.well-known/indexnow/`). */
const INDEXNOW_KEY_FILENAME_RE = /^[a-zA-Z0-9-]{8,128}\.txt$/;

export function isValidIndexNowKey(key: string | undefined): boolean {
  return Boolean(key?.trim() && INDEXNOW_KEY_RE.test(key.trim()));
}

/**
 * Plain-text key file body if `segment` is exactly `{INDEXNOW_KEY}.txt`; otherwise `null`.
 * Used for `/{key}.txt` and `/.well-known/indexnow/{key}.txt` (mirror for crawlers/tools).
 */
export function tryIndexNowKeyPlainTextResponse(
  filenameSegment: string,
): Response | null {
  const expected = process.env.INDEXNOW_KEY?.trim();
  if (!isValidIndexNowKey(expected)) return null;
  if (!INDEXNOW_KEY_FILENAME_RE.test(filenameSegment)) return null;
  const keyFromPath = filenameSegment.slice(0, -4);
  if (keyFromPath !== expected) return null;
  return new Response(expected, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export type IndexNowSubmitResult = {
  ok: boolean;
  /** HTTP status from IndexNow (last batch if multiple). */
  indexNowStatus: number;
  batches: number;
  urlCount: number;
  detail?: string;
};

/**
 * POSTs URL batches to api.indexnow.org (Bing + other participating engines).
 * Requires `INDEXNOW_KEY` and a hosted `{key}.txt` on the same host.
 */
export async function submitIndexNowUrls(
  urls: readonly string[],
): Promise<IndexNowSubmitResult> {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!isValidIndexNowKey(key)) {
    return {
      ok: false,
      indexNowStatus: 0,
      batches: 0,
      urlCount: urls.length,
      detail: "INDEXNOW_KEY is missing or invalid (8–128 chars: a-z A-Z 0-9 -).",
    };
  }

  const origin = siteOrigin();
  const host = new URL(origin).host;
  const keyLocation = `${origin}/${key}.txt`;

  const batches = chunk(urls, MAX_URLS_PER_REQUEST);
  let lastStatus = 200;
  let lastText = "";

  for (const urlList of batches) {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList,
      }),
    });
    lastStatus = res.status;
    lastText = await res.text().catch(() => "");
    if (!res.ok) {
      return {
        ok: false,
        indexNowStatus: lastStatus,
        batches: batches.length,
        urlCount: urls.length,
        detail: lastText.slice(0, 500) || res.statusText,
      };
    }
  }

  return {
    ok: true,
    indexNowStatus: lastStatus,
    batches: batches.length,
    urlCount: urls.length,
    detail: lastText || undefined,
  };
}
