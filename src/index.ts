import { Plugin, ResolvedConfig, UserConfig } from "vite";
import { Plugin as EsbuildPlugin, PluginBuild, OnResolveArgs } from "esbuild";

/**
 * Creates a RegExp filter for the provided external modules
 *
 * @param {string[]} externals - The list of external modules
 *
 * @returns {RegExp} A RegExp that matches any of the external modules
 */
const makeFilter = (externals: string[]): RegExp => {
  const externalPatterns = externals.join("|");
  const regex = new RegExp(`^(${externalPatterns})(\\/.*)?$`);
  return regex;
};

interface PluginOptions {
  externals: string[];
}

/**
 * Creates a plugin for esbuild to externalize specific modules
 * esbuild is used by Vite during development
 *
 * @param {Object} options - Includes a list of modules to externalize
 * @param {string[]} options.externals - The list of modules to externalize
 *
 * @returns {Object} The esbuild plugin
 */

const esbuildPluginExternalize = ({
  externals,
}: PluginOptions): EsbuildPlugin => {
  const externalFilter = makeFilter(externals);

  return {
    name: "externalize",
    setup(build: PluginBuild) {
      build.onResolve({ filter: externalFilter }, (args: OnResolveArgs) => ({
        path: args.path,
        namespace: "externalize",
      }));

      build.onLoad({ filter: externalFilter }, () => ({
        contents: "",
      }));
    },
  };
};

/**
 * Creates a plugin to remove prefix from imports injected by Vite
 * If module is externalized, Vite will prefix imports with "/@id/" during development
 *
 * @param {string[]} externals - The list of external modules
 *
 * @returns {Object} Vite plugin to remove prefix from imports
 */
const modulePrefixTransform = (externals: string[]) => {
  const viteImportAnalysisModulePrefix = "/@id/";
  const prefixedImportRegex = new RegExp(
    `${viteImportAnalysisModulePrefix}(${externals.join("|")})`,
    "g",
  );

  return {
    name: "vite-plugin-remove-prefix",
    transform: (code: string): string => {
      if (prefixedImportRegex.test(code)) {
        return code.replace(
          prefixedImportRegex,
          (_: string, externalName: string) => externalName,
        );
      }
      return code;
    },
  };
};

/**
 * Creates a Vite plugin to externalize specific modules
 * This plugin is only used during development
 * To externalize modules in production, configure build.rollupOptions.external
 *
 * @param {string[]} externals - The list of modules to externalize.
 *
 * @returns {Plugin} The Vite plugin.
 */
const vitePluginExternalize = (options: PluginOptions): Plugin => {
  const { externals } = options;

  return {
    name: "vite-plugin-externalize",
    enforce: "pre",
    apply: "serve",
    config: (config: UserConfig): UserConfig | undefined => {
      const modifiedConfiguration = { ...config };
      if (
        modifiedConfiguration.optimizeDeps &&
        modifiedConfiguration.optimizeDeps.esbuildOptions
      ) {
        modifiedConfiguration.optimizeDeps.esbuildOptions.plugins ??= [];

        modifiedConfiguration.optimizeDeps.esbuildOptions.plugins.push(
          esbuildPluginExternalize({ externals }),
        );
      }
      return modifiedConfiguration;
    },
    configResolved: (resolvedConfig: ResolvedConfig) => {
      const modulePrefixTransformPlugin = modulePrefixTransform(externals);
      // Plugins are read-only, and should not be modified,
      // however modulePrefixTransformPlugin MUST run after vite:import-analysis (which adds the prefix to imports)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      resolvedConfig.plugins.push(modulePrefixTransformPlugin);
    },
    resolveId: (id: string) => {
      if (externals.includes(id)) {
        return { id, external: true };
      }

      // eslint-disable-next-line unicorn/no-null
      return null;
    },
    load: (id: string) => {
      if (externals.includes(id)) {
        // Vite will try to resolve the modules even when externalized
        // In order to suppress the warning, a stub module is returned
        return "export default {};";
      }

      // eslint-disable-next-line unicorn/no-null
      return null;
    },
  };
};

// eslint-disable-next-line import/no-default-export
export default vitePluginExternalize;
