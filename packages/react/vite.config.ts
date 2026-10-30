import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const raiz = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: `${raiz}dist`,
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      // The barcode scanner is its own entry: apps that never use it never download it.
      entry: { index: `${raiz}src/index.ts`, barcode: `${raiz}src/barcode.ts` },
      formats: ["es"],
      fileName: (_formato, nome) => `${nome}.js`,
      cssFileName: "styles",
    },
    rollupOptions: {
      // React stays with the app: one copy, the app's version.
      external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client", /^@zxing\//],
    },
  },
  test: {
    root: raiz,
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
