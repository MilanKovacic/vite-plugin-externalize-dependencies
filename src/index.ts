import { Plugin, ResolvedConfig, UserConfig } from "vite";

/**
 * Creates a plugin for esbuild to externalize specific modules
 * esbuild is used by Vite during development
 *
 * @param {Object} options - Includes a list of modules to externalize
 * @param {string[]} options.externals - The list of modules to externalize
 *
 * @returns {Object} The esbuild plugin
 */
const esbuildPluginExternalize = ({ externals }: { externals: string[] }) => {
  const externalFilter = makeFilter(externals);

  return {
    name: "externalize",
    setup(build: any) {
      // Supresses the following error:
      // The entry point [moduleName] cannot be marked as external
      build.onResolve({ filter: externalFilter }, (args: any) => {
        return {
          path: args.path,
          namespace: "externalize",
        };
      });

      // Supresses the following error:
      // Do not know how to load path: [namespace:moduleName]
      build.onLoad({ filter: externalFilter }, () => {
        return {
          contents: "",
        };
      });
    },
  };
};

/**
 * Creates a RegExp filter for the provided external modules
 *
 * @param {string[]} externals - The list of external modules
 *
 * @returns {RegExp} A RegExp that matches any of the external modules
 */
const makeFilter = (externals: string[]) => {
  const externalPatterns = externals.join("|");
  const regex = new RegExp(`^(${externalPatterns})(\\/.*)?$`);
  return regex;
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
    transform: (code: string) => {
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

interface PluginOptions {
  externals: string[];
}

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
    config: (config: UserConfig) => {
      if (config && config.optimizeDeps && config.optimizeDeps.esbuildOptions) {
        config.optimizeDeps.esbuildOptions.plugins ??= [];

        config.optimizeDeps.esbuildOptions.plugins.push(
          esbuildPluginExternalize({ externals: externals }),
        );
      }
    },
    configResolved: (resolvedConfig: ResolvedConfig) => {
      const modulePrefixTransformPlugin = modulePrefixTransform(externals);
      // Plugins are read-only, and should not be modified,
      // however modulePrefixTransformPlugin MUST run after vite:import-analysis (which adds the prefix to imports)
      // @ts-ignore
      resolvedConfig.plugins.push(modulePrefixTransformPlugin);
    },
    resolveId: (id: string) => {
      if (externals.includes(id)) {
        return { id, external: true };
      }
    },
    // Supresses the following warning:
    // The following dependencies are imported but could not be resolved:
    // [dependency] (imported by [sourceFile])
    load: (id: string) => {
      if (externals.includes(id)) {
        // Vite will try to resolve the modules even when externalized
        // In order to supress the warning, a stub module is returned
        return "export default {};";
      }
    },
  };
};

export default vitePluginExternalize;
