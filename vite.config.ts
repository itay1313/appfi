import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Raise the warning threshold — we track it ourselves via manualChunks.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        /**
         * Split vendors into stable, cacheable chunks.
         * Browsers can download chunks in parallel and re-use cached vendor
         * chunks across deployments (only the app chunk changes on each release).
         */
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // React runtime — needed by everything, load first.
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) {
            return "react-vendor";
          }
          // Routing
          if (id.includes("react-router")) return "router";
          // Data fetching + state
          if (id.includes("@tanstack")) return "query";
          // Headless UI primitives
          if (id.includes("@base-ui")) return "ui-primitives";
          // Validation
          if (id.includes("zod")) return "zod";
          // Icons (large but tree-shaken at module level)
          if (id.includes("lucide")) return "icons";
          // All other node_modules
          return "vendor";
        },
      },
    },
  },
});
