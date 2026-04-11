import type { Plugin } from "vite";

/**
 * Route modules run on both server (SSR) and client. Vite HMR can apply the server
 * bundle before the client chunk updates, which makes React throw hydration mismatches
 * after layout edits. Force a full reload when route (or app shell) sources change so
 * HTML and client JS always match.
 *
 * Also reload on `app.css` and selected shared components: Tailwind’s CSS HMR often logs
 * “Failed to reload /app/app.css” after edits; a full reload recovers cleanly. Components
 * imported only from routes do not live under `routes/`, so route-only matching would miss them.
 */
export function fullReloadOnRouteModules(): Plugin {
  const norm = (p: string) => p.replace(/\\/g, "/");

  const triggersFullReload = (file: string): boolean => {
    const f = norm(file);
    if (f.endsWith("/app/app.css")) return true;
    if (f.endsWith("/app/routes.ts")) return true;
    if (f.endsWith("/app/root.tsx")) return true;
    if (f.endsWith("/app/react-router.config.ts")) return true;
    if (
      f.includes("/app/components/status-") &&
      /\.(m?[jt]sx?)$/.test(f)
    ) {
      return true;
    }
    if (
      f.includes("/app/components/") &&
      (f.includes("github-sign-in-cta") || f.includes("github-mark-icon"))
    ) {
      return true;
    }
    if (!f.includes("/app/routes/")) return false;
    return /\.(m?[jt]sx?)$/.test(f);
  };

  return {
    name: "full-reload-route-modules",
    enforce: "pre",
    handleHotUpdate(ctx) {
      if (!triggersFullReload(ctx.file)) return;
      ctx.server.hot.send({
        type: "full-reload",
        path: "*",
        triggeredBy: ctx.file,
      });
      // Do not `return []` — that skips Vite’s normal HMR. If the full-reload message
      // is missed (WS race, tab in background), the client would keep stale route JS
      // while SSR already serves the new tree → hydration mismatch.
    },
  };
}
