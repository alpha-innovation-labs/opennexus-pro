# Attempt 4: Fix `Cannot find module 'marked'` Error

## Error

```
Error: Failed to load extension "/Users/alpha/.local/share/nexus/agent/npm/node_modules/@plannotator/pi-extension": Failed to load extension: Cannot find module 'marked'
Require stack:
- /Users/alpha/workspace/alpha-innovation-labs/__nexus/nexus-tui-awesome/node_modules/@earendil-works/pi-tui/dist/index.js
Hint: Start without extensions using "pi -ne".
```

## Root Cause Analysis

### The Full Chain

1. The tsdown-built ELF binary loads `@earendil-works/pi-coding-agent` (bundled via `onlyBundle`)
2. The extension loader (`loader.js`) loads extensions using **jiti**
3. For non-Bun builds, jiti is configured with **aliases** from `getAliases()` (not `VIRTUAL_MODULES`)
4. `getAliases()` resolves `@earendil-works/pi-tui` to `node_modules/@earendil-works/pi-tui/dist/index.js`
5. That file has `export { Marked } from "marked"` — a bare import
6. When jiti loads that file, it needs to resolve `marked`
7. **pnpm** uses a strict node_modules layout — `marked` is at `node_modules/.pnpm/marked@18.0.5/node_modules/marked/`, NOT at `node_modules/marked/`
8. `require.resolve('marked')` fails because there's no top-level symlink for `marked`
9. jiti throws "Cannot find module 'marked'"

### Why `VIRTUAL_MODULES` Doesn't Help

`VIRTUAL_MODULES` maps `@earendil-works/pi-tui` to the bundled `_bundledPiTui` object. But this is only used in Bun binary mode (`isBunBinary`). For tsdown builds, `isBunBinary` returns `false`, so jiti uses `alias: getAliases()` instead.

### Why `getAliases()` Doesn't Include `marked`

`getAliases()` only aliases:
- `@earendil-works/pi-coding-agent`
- `@earendil-works/pi-agent-core`
- `@earendil-works/pi-tui`
- `@earendil-works/pi-ai` (and variants)
- `typebox` (and variants)

It does NOT alias transitive dependencies like `marked` that are used inside bundled packages.

### Why `marked` IS in `onlyBundle` But Still Missing

`marked` is in `onlyBundle`, meaning tsdown should bundle it into the ELF. And indeed, parts of `marked` ARE bundled (we see `StrictStrikethroughTokenizer` in the binary). However, the re-export `export { Marked } from "marked"` in `pi-tui/dist/index.js` is NOT inlined by tsdown — it stays as a bare import at the module boundary.

When jiti loads the aliased `pi-tui` file path (from `node_modules/`), it encounters this bare `marked` import and tries to resolve it at runtime. Since `marked` isn't in the aliases and pnpm's layout doesn't have a top-level `marked` symlink, resolution fails.

## Why Previous Attempts Didn't Fix This

### Attempt 1
Fixed `settings.json` missing — a different error entirely.

### Attempt 2
Fixed `dark.json` theme missing by setting `PI_PACKAGE_DIR` and copying themes. This resolved the theme error but not the extension loading error.

### Attempt 3
Fixed `(intermediate value).resolve is not a function` by patching `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js` to replace `import.meta.resolve` with a multi-tier fallback. This was necessary for workspace package resolution, but it didn't address the `marked` import resolution issue.

## Fix Applied

### Modified: `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js`

Added `marked` to the aliases in `getAliases()`:

```js
const markedEntry = require.resolve("marked");
```

And in the `_aliases` object:

```js
marked: markedEntry,
```

This ensures that when jiti loads `@earendil-works/pi-tui` (which imports `marked`), it can resolve `marked` to its actual location in the pnpm dependency tree.

### Why This Works

1. `require.resolve("marked")` works because Node.js's module resolution CAN find `marked` through the pnpm tree (it traverses `node_modules/.pnpm/` chains)
2. The resolved path points to `marked/lib/marked.esm.js` (the ESM entry point)
3. jiti uses this alias to resolve the bare `marked` import inside `@earendil-works/pi-tui`
4. Extensions that transitively depend on `@earendil-works/pi-tui` (like `@plannotator/pi-extension`) can now load successfully

## Files Modified

- `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js` — added `marked` to the aliases in `getAliases()`

## Notes

- `marked` is already in the `onlyBundle` list in `tsdown.config.ts`, so it's bundled into the ELF. The alias just helps jiti resolve the import at extension load time.
- Other transitive dependencies of bundled packages might have the same issue. Consider whether other packages in `onlyBundle` have bare imports that aren't in the aliases.
- This is a patch to a `node_modules` file. A proper fix would be in the `@earendil-works/pi-coding-agent` package to include `marked` in its aliases, or in the `tsdown.config.ts` to handle this differently.
- Alternative: Use `deps: { alwaysBundle: [...] }` instead of `onlyBundle` to have more control over what gets bundled.
