import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import externalize from "./src/index";

const disablePlugin = process.env.DISABLE_PLUGIN === "true";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: disablePlugin
    ? []
    : [
        externalize({ externals: ["custom-logger"] }),
        dts({ rollupTypes: true }),
      ],
  build: {
    sourcemap: true,
    lib: {
      // eslint-disable-next-line unicorn/prefer-module
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: "index",
    },
  },
});
