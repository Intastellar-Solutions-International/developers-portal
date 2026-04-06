export type StatusTarget = {
  id: string;
  name: string;
  url: string;
  /** Default GET. HEAD avoids downloading large static assets. */
  method?: "GET" | "HEAD";
};

function parseTargetsJson(raw: string | undefined): StatusTarget[] | null {
  if (!raw?.trim()) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return null;
    const out: StatusTarget[] = [];
    for (const row of v) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : "";
      const name = typeof o.name === "string" ? o.name : "";
      const url = typeof o.url === "string" ? o.url : "";
      const method = o.method === "HEAD" || o.method === "GET" ? o.method : undefined;
      if (!id || !name || !url) continue;
      try {
        new URL(url);
      } catch {
        continue;
      }
      out.push(method ? { id, name, url, method } : { id, name, url });
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

/** Default checks — override entirely with `STATUS_CHECK_TARGETS_JSON` or extend with `STATUS_CHECK_EXTRA_JSON`. */
const DEFAULT_TARGETS: StatusTarget[] = [
  {
    id: "consents-login",
    name: "Intastellar Consents",
    url: "https://www.intastellarconsents.com",
  },
  {
    id: "consents-uc",
    name: "Consents CDN (uc.js)",
    url: "https://consents.cdn.intastellarsolutions.com/uc.js",
    method: "HEAD",
  },
  {
    id: "inta-dev",
    name: "inta.dev - Developer Portal",
    url: "https://inta.dev/",
    method: "HEAD",
  },
  {
    id: "analytics-collect-health",
    name: "Intastellar Consents — analytics collect (health)",
    url: "https://analytics.intastellarsolutions.com/collect?health=1",
  },
];

/**
 * Targets for this run. Set `STATUS_CHECK_TARGETS_JSON` to a JSON array of
 * `{ "id", "name", "url", "method"? }` to replace defaults. Optionally append
 * more with `STATUS_CHECK_EXTRA_JSON` (same shape) when not overriding.
 */
export function getStatusTargets(): StatusTarget[] {
  const fullOverride = parseTargetsJson(process.env.STATUS_CHECK_TARGETS_JSON);
  if (fullOverride?.length) return fullOverride;
  const extra = parseTargetsJson(process.env.STATUS_CHECK_EXTRA_JSON) ?? [];
  return [...DEFAULT_TARGETS, ...extra];
}
