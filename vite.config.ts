import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import { fullReloadOnRouteModules } from "./vite-plugin-full-reload-routes";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    /** Run after RR/Tailwind `hotUpdate` so returning `[]` clears partial client HMR. */
    fullReloadOnRouteModules(),
  ],
  server: {
    headers: {
      "Cache-Control": "no-store",
    },
  },
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const n = id.replace(/\\/g, "/");
          if (n.includes("/lib/i18n/messages/") && /\.[cm]?tsx?$/.test(n)) {
            return "i18n-messages";
          }
        },
      },
    },
  },
});
