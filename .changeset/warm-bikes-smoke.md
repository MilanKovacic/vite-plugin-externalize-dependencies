---
"vite-plugin-externalize-dependencies": minor
---

feat: add options to externalize modules with regex, or a custom function

breaking: plugin will now automatically externalize all subexports of a module. For example, if "react" is externalized, subexports such as "react/jsx-runtime" will also be externalized. Currently, this behavior only applies to modules externalized by name (exact match).
