# Vite Plugin Externalize Dependencies [![npm](https://img.shields.io/npm/v/vite-plugin-externalize-dependencies.svg)](https://www.npmjs.com/package/vite-plugin-externalize-dependencies)

A simplified plugin for Vite that allows you to exclude specific dependencies from the Vite bundle during development.

The following errors/warnings are supressed:

- The entry point [moduleName] cannot be marked as external
- Do not know how to load path: [namespace:moduleName]
- Failed to resolve import [dependency] from [sourceFile]. Does the file exist?
- The following dependencies are imported but could not be resolved: [dependency] (imported by [sourceFile])

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Requirements](#requirements)
- [Contributing and Development](#contributing-and-development)
- [Known Issues & limitations](#known-issues)
- [Support](#support)
- [License](#license)

## Installation

To install the plugin, use npm:

`npm i vite-plugin-externalize-dependencies --save-dev`

## Usage

After installing the plugin, import it, and add it to Vite configuration:

```javascript
import { defineConfig } from "vite";
import externalize from "vite-plugin-externalize-dependencies";

export default defineConfig({
  plugins: [externalize({ externals: ["externalized-dependency"] })],
});
```

## Requirements

The plugin is intended to be consumed by Vite.

## Contributing and Development

Contributions are welcome! If you wish to contribute, you can use the following npm commands to help facilitate your development process:

- **dev**: Serve index.html for development testing.
- **build**: Build the plugin.
- **test**: Run tests to verify expected outputs.

Use them as follows:

```
npm run dev
npm run build
npm run test
```

Please feel free to open a pull request with your changes or improvements.

## Known Issues & limitations

This plugin is designed to work during development. For production, users should manually configure build.rollupOptions.external in Vite.

## Support

If you encounter any problems or have any issues, please open a new issue in the GitHub repository.

## License

This project is licensed under the MIT License.
