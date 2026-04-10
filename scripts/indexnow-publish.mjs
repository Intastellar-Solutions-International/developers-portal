#!/usr/bin/env node
/**
 * POSTs the full sitemap URL list to IndexNow via this app’s publish endpoint.
 * Run after deploy (e.g. Vercel “Ignored Build Step” hook or CI) when env vars are set.
 *
 * Required: INDEXNOW_PUBLISH_SECRET
 * Optional: INDEXNOW_PUBLISH_BASE_URL (default: VITE_SITE_ORIGIN or https://inta.dev)
 */

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

const url = `${base}/api/indexnow/publish`;
const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  },
  body: "",
});

const text = await res.text();
console.log(`[indexnow] ${res.status} ${url}`);
console.log(text);
process.exit(res.ok ? 0 : 1);
