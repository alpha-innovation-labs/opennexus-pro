# Nexus TUI — Bundled Binary Fix Attempts (Summary)

## Overview

Six iterative attempts were made to fix the tsdown-built ELF binary for the Nexus TUI app. Each attempt fixed one error, only to reveal the next. The root theme is: bundling `@earendil-works/pi-coding-agent` via tsdown (`onlyBundle`) breaks several path-resolution assumptions that work fine in the development environment.

---

## Error Chain (in order of appearance)

| # | Error | Attempt |
|---|-------|---------|
| 1 | `ENOENT: no such file or directory, open '.../build/default-settings/settings.json'` | Attempt 1 |
| 2 | `ENOENT: no such file or directory, open '.../src/modes/interactive/theme/dark.json'` | Attempt 2 |
| 3 | `(intermediate value).resolve is not a function` *(not documented in files, referenced in later attempts)* | Attempt 3 |
| 4 | `Cannot find module 'marked'` | Attempt 4 |
| 5 | `marked` resolved to wrong pnpm entry *(improvement, not a new error)* | Attempt 5 |
| 6 | `Cannot find module '.'` | Attempt 6 |
| 7 | `Cannot find module '.'` (final comprehensive fix) | Attempt 7 |

---

## Attempt 1 — `settings.json` Missing

### Error
```
Error: ENOENT: no such file or directory, open '.../build/default-settings/settings.json'
```

### Root Cause
`getBundledDefaultSettingsPath()` in `@nexus/runtime` falls back to `${dirname(import.meta.url)}/default-settings/settings.json`. In the tsdown-built binary, `import.meta.url` points to `build/`, but the `build:done` hook only copied `prompts/system_prompt.md`, not `settings.json`.

### Fix
Updated `apps/tui/tsdown.config.ts` to copy `default-settings/settings.json` to `build/default-settings/settings.json` in the `build:done` hook.

---

## Attempt 2 — `dark.json` Theme Missing

### Error
```
Error: ENOENT: no such file or directory, open '.../src/modes/interactive/theme/dark.json'
```

### Root Cause
`@earendil-works/pi-coding-agent`'s `getPackageDir()` walks up from `__dirname` looking for `package.json`, finds `apps/tui/package.json`, and resolves theme paths relative to the source tree — not the bundled output. `PI_PACKAGE_DIR` was never set because `ensureEmbeddedPackageDirEnv()` only handles Bun binaries.

### Fix
1. Added `isTsdownBundledBinary()` to detect tsdown builds and set `PI_PACKAGE_DIR=build/` in `ensureEmbeddedPackageDirEnv()`.
2. Updated `tsdown.config.ts` to copy theme files (`dark.json`, `light.json`) to `build/src/modes/interactive/theme/`.

---

## Attempt 3 — `import.meta.resolve` Not a Function

### Error
```
(intermediate value).resolve is not a function
```

### Root Cause
`import.meta.resolve` is not available in the bundled binary context.

### Fix
Patched `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js` to replace `import.meta.resolve` with a multi-tier fallback for workspace package resolution.

---

## Attempt 4 — `Cannot find module 'marked'`

### Error
```
Error: Failed to load extension ".../@plannotator/pi-extension": Failed to load extension: Cannot find module 'marked'
Require stack:
- .../node_modules/@earendil-works/pi-tui/dist/index.js
```

### Root Cause
`@earendil-works/pi-tui` re-exports `Marked` from `"marked"`. When jiti loads this file during extension loading, it tries to resolve `marked` as a bare import. pnpm's strict layout has no top-level symlink, and `marked` was not in the alias map used by jiti.

### Fix
Added `marked` to the aliases in `getAliases()` in `loader.js`:
```js
const markedEntry = require.resolve("marked");
// ... added to _aliases object
```

---

## Attempt 5 — Improve `resolveTransitive` for Standalone Packages

### Problem
`resolveTransitive()` returned the first matching `.pnpm` entry alphabetically. Since `@earendil-works+pi-tui@0.84.1` sorts before `marked@18.0.5`, it could resolve `marked` to a nested copy inside `pi-tui`'s pnpm tree instead of the standalone package.

### Fix
Modified `resolveTransitive` to:
1. Sort entries alphabetically for deterministic behavior
2. Prefer **standalone** packages (entry name starts with `specifier@`) over **transitive** ones (nested inside another package)
3. Fall back to the first transitive match if no standalone match exists

---

## Attempt 6 — `Cannot find module '.'`

### Error
```
Error: Failed to load extension ".../@plannotator/pi-extension": Failed to load extension: Cannot find module '.'
Require stack:
- .../pi-tui/dist/components/markdown.js
```

### Root Cause
`@plannotator/pi-extension` has `"pi": { "extensions": ["./"] }` in its manifest. The `resolveExtensionEntries` function resolved `"./"` to the package directory itself, then passed that directory path to jiti. jiti can't resolve a directory as a module, so it threw `Cannot find module '.'`.

### Fix
Added a directory check in `resolveExtensionEntries`: when the resolved path is a directory, look for `index.ts` (preferred) or `index.js` inside it before pushing to the entries list.

---

## Attempt 7 — Final Comprehensive Fix

### Error
Same `Cannot find module '.'` error, but the deeper root cause was uncovered: `resolveTransitive()` couldn't find the `.pnpm` directory from within the binary context.

### Root Cause
When Node.js runs a single-executable binary, it extracts embedded files to a temp directory (e.g., `/tmp/node-binary-xxx/`). `import.meta.url` points to this temp directory, so walking up from it never finds the workspace's `.pnpm` directory. Additionally, the original walk only checked for `.pnpm` as a direct child, but pnpm uses `node_modules/.pnpm`.

### Fixes Applied

#### 1. `loader.js` — `resolveTransitive()`
- Added `process.execPath` (binary path) as a second search directory alongside `import.meta.url`
- Changed search from `.pnpm` to `node_modules/.pnpm` (standard pnpm layout)
- Increased walk depth from 10 to 15

#### 2. `loader.js` — `resolveWorkspaceOrImport()`
- Added workspace root detection by walking up from `process.execPath` looking for `apps/tui` or the right `package.json`
- Modified to prefer `workspaceRoot` for workspace-relative paths
- Changed node_modules fallback to walk from `process.execPath` instead of `packagesRoot`

#### 3. `tsdown.config.ts` — `build:done` hook
- Added `existsSync()` checks before copying files (robustness)
- Fixed theme source path to search multiple locations (`node_modules/` and `.pnpm/`)
- Fixed theme destination from `build/src/` to `build/dist/` (matching Node.js dist layout)
- Added `existsSync` to the `node:fs` import

### Verification
- Build completes successfully
- Binary runs: `./apps/tui/build/index-darwin-arm64 "hello"` → shows Nexus greeting
- Extensions load without errors (including `@plannotator/pi-extension`)
- `--help` works correctly

---

## Files Modified (Final State)

1. **`node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js`**
   - `isTsdownBundledBinary()` added
   - `resolveTransitive()` — dual search dirs, `node_modules/.pnpm` layout, deeper walk
   - `resolveWorkspaceOrImport()` — workspace root detection from `process.execPath`
   - `marked` alias added
   - Directory → index file fallback in `resolveExtensionEntries`
   - `import.meta.resolve` patched with multi-tier fallback

2. **`packages/nexus-runtime/src/package/embedded-assets/ensureEmbeddedPackageDirEnv.ts`**
   - `isTsdownBundledBinary()` helper
   - `PI_PACKAGE_DIR` set for tsdown builds

3. **`apps/tui/tsdown.config.ts`**
   - `build:done` hook copies `settings.json`, `system_prompt.md`, and theme files
   - Robust `existsSync` checks and multiple source path searches
   - Correct destination paths (`build/dist/` for themes)

---

## Known Limitations

- Patches to `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js` are applied to the installed package. A proper fix belongs in the `@earendil-works/pi-coding-agent` package itself.
- Workspace root detection in `resolveWorkspaceOrImport()` looks for `apps/tui` or specific `package.json` names — may need tuning for CI/CD or different directory structures.
- The `build:done` hook's glob pattern `@earendil-works+pi-coding-agent@*` might not work in all cases.
