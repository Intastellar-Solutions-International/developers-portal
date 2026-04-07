import type { Plugin } from "vite";

/**
 * Route modules run on both server (SSR) and client. Vite HMR can apply the server
 * bundle before the client chunk updates, which makes React throw hydration mismatches
 * after layout edits. Force a full reload when route (or app shell) sources change so
 * HTML and client JS always match.
 */
export function fullReloadOnRouteModules(): Plugin {
  const norm = (p: string) => p.replace(/\\/g, "/");

  const triggersFullReload = (file: string): boolean => {
    const f = norm(file);
    if (f.endsWith("/app/routes.ts")) return true;
    if (f.endsWith("/app/root.tsx")) return true;
    if (f.endsWith("/app/react-router.config.ts")) return true;
    if (
      f.includes("/app/components/status-") &&
      /\.(m?[jt]sx?)$/.test(f)
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
      return [];
    },
  };
}
