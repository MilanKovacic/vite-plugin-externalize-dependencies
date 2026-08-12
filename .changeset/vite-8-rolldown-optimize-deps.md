---
"vite-plugin-externalize-dependencies": major
---

Support Vite 8 by registering the optimize-deps externalize plugin via `optimizeDeps.rolldownOptions` instead of the deprecated `optimizeDeps.esbuildOptions`.

This is a breaking change: the peer dependency is now `vite@^8.0.0`.

Fixes #117
