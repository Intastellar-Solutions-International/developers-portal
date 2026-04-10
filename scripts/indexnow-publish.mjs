#!/usr/bin/env node
/**
 * POSTs the full sitemap URL list to IndexNow via this app’s publish endpoint.
 * Run after deploy (e.g. Vercel “Ignored Build Step” hook or CI) when env vars are set.
 *
 * Required: INDEXNOW_PUBLISH_SECRET
 * Optional: INDEXNOW_PUBLISH_BASE_URL (default: VITE_SITE_ORIGIN or https://inta.dev)
 *
 * Uses node:http(s) instead of fetch so this works on Node < 18.
 */

import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

const secret = process.env.INDEXNOW_PUBLISH_SECRET?.trim();
const base = (
  process.env.INDEXNOW_PUBLISH_BASE_URL?.trim() ||
  process.env.VITE_SITE_ORIGIN?.trim() ||
  "https://inta.dev"
).replace(/\/$/, "");

if (!secret) {
  console.warn("[indexnow] INDEXNOW_PUBLISH_SECRET unset; skipping publish.");
  process.exit(0);
}

const urlStr = `${base}/api/indexnow/publish`;

/**
 * @param {string} urlStr
 * @param {Record<string, string>} headers
 * @param {string} body
 * @returns {Promise<{ ok: boolean; status: number; text: string }>}
 */
function httpPost(urlStr, headers, body) {
  const u = new URL(urlStr);
  const isHttps = u.protocol === "https:";
  const lib = isHttps ? https : http;
  const port = u.port ? Number(u.port) : isHttps ? 443 : 80;
  const pathWithQuery = u.pathname + u.search;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        hostname: u.hostname,
        port,
        path: pathWithQuery,
        method: "POST",
        headers: {
          ...headers,
          "Content-Length": String(Buffer.byteLength(body, "utf8")),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          const status = res.statusCode ?? 0;
          resolve({
            ok: status >= 200 && status < 300,
            status,
            text,
          });
        });
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const { ok, status, text } = await httpPost(
  urlStr,
  {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  },
  "",
);

console.log(`[indexnow] ${status} ${urlStr}`);
console.log(text);
process.exit(ok ? 0 : 1);
