// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
import { Plugin, ResolvedConfig, UserConfig } from "vite";
import { Plugin as EsbuildPlugin, PluginBuild, OnResolveArgs } from "esbuild";

type ExternalCriteria = string | RegExp | ((id: string) => boolean);

interface PluginOptions {
  externals: ExternalCriteria[];
}

const resolvedExternals = new Set<string>();

const isExternal = (id: string, externals: ExternalCriteria[]): boolean =>
  externals.some((external) => {
    if (typeof external === "string") {
      return id === external || id.startsWith(`${external}/`);
    }

    if (external instanceof RegExp) {
      return external.test(id);
    }

    if (typeof external === "function") {
      return external(id);
    }

    return false;
  });

/**
 * Creates a plugin for esbuild to externalize specific modules.
 * esbuild is used by Vite during development.
 * This plugin is injected into optimizeDeps.esbuildOptions.plugins, and runs during the dependency scanning / optimization phase.
 *
 * @param options - Plugin options
 *
 * @returns The esbuild plugin
 */
const esbuildPluginExternalize = (
  externals: ExternalCriteria[],
): EsbuildPlugin => ({
  name: "externalize",
  setup(build: PluginBuild) {
    // Supresses the following error:
    // The entry point [moduleName] cannot be marked as external
    build.onResolve({ filter: /.*/ }, (args: OnResolveArgs) => {
      if (isExternal(args.path, externals)) {
        resolvedExternals.add(args.path);
        return { path: args.path, namespace: "externalized-modules" };
      }

      return null;
    });
    // Supresses the following error:
    // Do not know how to load path: [namespace:moduleName]
    build.onLoad({ filter: /.*/ }, (args) => {
      if (isExternal(args.path, externals)) {
        return { contents: "" };
      }

      return null;
    });
  },
});

/**
 * Creates a plugin to remove prefix from imports injected by Vite.
 * If module is externalized, Vite will prefix imports with "/\@id/" during development.
 *
 * @param externals - The list of external modules
 *
 * @returns Vite plugin to remove prefix from imports
 */
const modulePrefixTransform = (): Plugin => {
  const viteImportAnalysisModulePrefix = "/@id/";
  const prefixedImportRegex = new RegExp(
    `${viteImportAnalysisModulePrefix}(${[...resolvedExternals].join("|")})`,
    "g",
  );

  return {
    name: "vite-plugin-remove-prefix",
    transform: (code: string): string => {
      if (prefixedImportRegex.test(code)) {
        // eslint-disable-next-line unicorn/prefer-string-replace-all
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
 * Creates a Vite plugin to externalize specific modules.
 * This plugin is only used during development.
 * To externalize modules in production, configure build.rollupOptions.external.
 *
 * @param externals - The list of modules to externalize.
 *
 * @returns The Vite plugin.
 */
const vitePluginExternalize = (options: PluginOptions): Plugin => ({
  name: "vite-plugin-externalize",
  enforce: "pre",
  apply: "serve",
  config: (config: UserConfig): UserConfig | undefined => {
    const modifiedConfiguration = { ...config };

    modifiedConfiguration.optimizeDeps ??= {};
    modifiedConfiguration.optimizeDeps.esbuildOptions ??= {};
    modifiedConfiguration.optimizeDeps.esbuildOptions.plugins ??= [];

    // Prevent the plugin from being inserted multiple times
    const pluginName = "externalize";
    const isPluginAdded =
      modifiedConfiguration.optimizeDeps.esbuildOptions.plugins.some(
        (plugin) => plugin.name === pluginName,
      );

    if (!isPluginAdded) {
      modifiedConfiguration.optimizeDeps.esbuildOptions.plugins.push(
        esbuildPluginExternalize(options.externals),
      );
    }

    return modifiedConfiguration;
  },
  configResolved: (resolvedConfig: ResolvedConfig) => {
    // Plugins are read-only, and should not be modified,
    // however modulePrefixTransformPlugin MUST run after vite:import-analysis (which adds the prefix to imports)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    resolvedConfig.plugins.push(modulePrefixTransform());
  },
  // Supresses the following warning:
  // Failed to resolve import [dependency] from [sourceFile]. Does the file exist?
  resolveId: (id: string) => {
    if (resolvedExternals.has(id)) {
      return { id, external: true };
    }

    // During subsequent runs after the dependency optimization is completed, esbuild plugin might not be called.
    // This will cause the resolvedExternals to be empty, and the plugin will not be able to resolve the external modules, which is why a direct check is required.
    if (isExternal(id, options.externals)) {
      resolvedExternals.add(id);
      return { id, external: true };
    }

    return null;
  },
  // Supresses the following warning:
  // The following dependencies are imported but could not be resolved: [dependency] (imported by [sourceFile])
  load: (id: string) => {
    if (resolvedExternals.has(id)) {
      return { code: "export default {};" };
    }
    return null;
  },
});

// Justification: Vite plugins are expected to provide a default export
// eslint-disable-next-line import/no-default-export
export default vitePluginExternalize;
