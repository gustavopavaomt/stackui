import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const raiz = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The demo imports the library from source, exactly as an app imports the package.
    alias: { "@stackui/react/styles.css": `${raiz}src/styles/index.css`, "@stackui/react": `${raiz}src/index.ts` },
  },
  build: {
    outDir: `${raiz}dist`,
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: `${raiz}src/index.ts`,
      formats: ["es"],
      fileName: "index",
      cssFileName: "styles",
    },
    rollupOptions: {
      // React stays with the app: one copy, the app's version.
      external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
    },
  },
  test: {
    root: raiz,
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
