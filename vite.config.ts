import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import externalize from "./src/index";

const disablePlugin = process.env.DISABLE_PLUGIN === "true";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: disablePlugin
    ? []
    : [externalize({ externals: ["custom-logger"] }), dts()],
  build: {
    lib: {
      entry: new URL("src/index.ts", import.meta.url).pathname,
      formats: ["es", "cjs"],
      fileName: "index",
    },
  },
});
