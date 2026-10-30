import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const lib = fileURLToPath(new URL("../../packages/react/src/", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The playground uses the library source (instant reload). The published package is the same code.
    alias: { "stackui/styles.css": `${lib}styles/index.css`, "stackui": `${lib}index.ts` },
  },
});
