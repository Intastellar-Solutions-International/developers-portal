#!/usr/bin/env node
/**
 * Call `/api/status/cron` with the same Authorization header Vercel Cron uses
 * when CRON_SECRET is set in the project environment.
 *
 * Usage:
 *   CRON_SECRET=... STATUS_CRON_URL=https://inta.dev/api/status/cron node scripts/trigger-status-cron.mjs
 *   npm run status:cron
 */

const secret = process.env.CRON_SECRET?.trim();
const url =
  process.env.STATUS_CRON_URL?.trim() ||
  "http://127.0.0.1:5173/api/status/cron";

if (!secret) {
  console.error("CRON_SECRET is required (same value as Vercel / .env).");
  process.exit(1);
}

const res = await fetch(url, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${secret}`,
  },
});

const text = await res.text();
if (!res.ok) {
  console.error(res.status, text);
  process.exit(1);
}
console.log(text);
