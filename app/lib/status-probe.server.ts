import type { StatusTarget } from "./status-targets.server";
import type { StatusProbeResult } from "./status-probe-result";

export type { StatusProbeResult, StatusRegionalSlice } from "./status-probe-result";
export { resolveRegionalSlices } from "./status-probe-result";

const TIMEOUT_MS = 12_000;

/** Treat as up when we get an HTTP response and status is not a server error (5xx). */
function httpOk(status: number): boolean {
  return status >= 200 && status < 500;
}

export async function probeStatusTarget(target: StatusTarget): Promise<StatusProbeResult> {
  const method = target.method ?? "GET";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(target.url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "*/*",
        "User-Agent": "inta.dev-status-monitor/1.0",
      },
    });
    const latencyMs = Date.now() - started;
    return {
      id: target.id,
      name: target.name,
      url: target.url,
      ok: httpOk(res.status),
      statusCode: res.status,
      latencyMs,
      error: httpOk(res.status) ? null : `HTTP ${res.status}`,
    };
  } catch (err) {
    const latencyMs = Date.now() - started;
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Timeout"
          : err.message
        : "Request failed";
    return {
      id: target.id,
      name: target.name,
      url: target.url,
      ok: false,
      statusCode: null,
      latencyMs,
      error: message,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function runStatusProbes(
  targets: StatusTarget[],
): Promise<StatusProbeResult[]> {
  return Promise.all(targets.map((t) => probeStatusTarget(t)));
}

export function overallOk(results: StatusProbeResult[]): boolean {
  return results.length > 0 && results.every((r) => r.ok);
}
