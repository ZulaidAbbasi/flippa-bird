import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

// Standalone SPA build config for static hosting (Hostinger)
// This bypasses TanStack Start's SSR and builds a plain client-side React app.
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "deploy",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "spa-index.html"),
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
