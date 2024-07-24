# vite-plugin-externalize-dependencies

## 1.0.1

### Patch Changes

- c7cc8a6: fix duplicated esbuild plugins issue

## 1.0.0

### Major Changes

- 5725b75: Account for vite's base path config

### Patch Changes

- ccf6e51: Externalize dependencies inside node_modules

## 0.13.0

### Minor Changes

- ff30c3b: Fix the case when no externals are matched

## 0.12.0

### Minor Changes

- 8563878: Fix issue with plugin incorrectly handling non-externalized virtual modules

## 0.11.0

### Minor Changes

- eb2f298: feat: add options to externalize modules with regex, or a custom function

  breaking: plugin will now automatically externalize all subexports of a module. For example, if "react" is externalized, subexports such as "react/jsx-runtime" will also be externalized. Currently, this behavior only applies to modules externalized by name (exact match).

## 0.10.0

### Minor Changes

- 442a94f: Fix issue with external dependencies not being included in optimizeDeps.exclude

## 0.9.0

### Minor Changes

- 647dd32: Fix issue with externals still being included in optimizedeps.include

## 0.8.0

### Minor Changes

- 05dabfc: Fix issue with published typescript definitions not being combined in a single file
- bcbf210: Add a sourcemap

## 0.7.0

### Minor Changes

- 490269b: ci: update changeset configuration to allow publishing the package to npm

## 0.6.0

### Minor Changes

- e70b121: Add build command to the CI workflow
