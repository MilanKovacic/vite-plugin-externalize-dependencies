import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import externalize from "./src/index.js";

const disablePlugin = process.env.DISABLE_PLUGIN === "true";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  root: import.meta.dirname,
  plugins: disablePlugin
    ? []
    : [
        externalize({ externals: ["custom-logger", "react"] }),
        dts({ rollupTypes: true }),
      ],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: "index",
    },
  },
});
