# Attempt 7: Fix `Cannot find module '.'` Error — Complete Extension Loading Fix

## Summary

Fixed the persistent `Cannot find module '.'` error when loading `@plannotator/pi-extension` in the tsdown-built ELF binary. The root cause was that `resolveTransitive()` in the extension loader couldn't find the `.pnpm` directory from within the bundled binary context, causing the `marked` alias to be `null`. This caused jiti to fail resolving the `marked` import in `pi-tui/dist/components/markdown.js`.

## Root Cause Analysis

### The Full Error Chain

1. The tsdown-built ELF binary loads `@earendil-works/pi-coding-agent` (bundled via `onlyBundle`)
2. The extension loader (`loader.js`) loads extensions using **jiti** with aliases from `getAliases()`
3. `getAliases()` calls `resolveTransitive("marked")` to resolve the `marked` package
4. `resolveTransitive()` first tries `require.resolve("marked")` — fails because `marked` is not hoisted in pnpm
5. It then walks up from `import.meta.url` to find `.pnpm/` — **fails in the binary** because `import.meta.url` points to a temp directory extracted by Node.js, not the workspace
6. `resolveTransitive()` returns `null`, so the `marked` alias is `null`
7. When jiti loads `pi-tui/dist/components/markdown.js`, it encounters `import { Marked } from "marked"`
8. With no alias, jiti tries to resolve `marked` normally — fails because it's in `.pnpm/`
9. jiti throws `Cannot find module '.'` (where `.` is the package's main export specifier)

### Why `import.meta.url` Fails in the Binary

When Node.js runs a single-executable bundled binary, it extracts embedded files to a temporary directory (e.g., `/tmp/node-binary-xxx/`). The `import.meta.url` for bundled modules points to this temp directory. The `.pnpm` directory is in the workspace (`workspace/nexus-tui-awesome/node_modules/.pnpm`), not in the temp directory, so the walk up from `import.meta.url` never finds it.

### Why the `.pnpm` Walk Also Failed Before

The original walk looked for `.pnpm` as a direct child of each directory (`dir/.pnpm`). But `.pnpm` is inside `node_modules/` (`dir/node_modules/.pnpm`). The walk needed to check for `node_modules/.pnpm`.

### Additional Issue: `resolveWorkspaceOrImport` Also Fails in Binary Context

The `resolveWorkspaceOrImport()` function computes `packagesRoot` from `__dirname` (which is `import.meta.url` resolved to a path). In the binary, this points to the temp directory, not the workspace. The function then tries to resolve workspace-relative paths (like `tui/dist/index.js`) from the wrong root, producing malformed paths like `.../node_modules/.pnpm/.../node_modules/@earendil-works/node_modules/@earendil-works/pi-ai/dist/index.js`.

## What Was Changed

### 1. `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js` — `resolveTransitive()`

**Problem**: The function only walked up from `import.meta.url` to find `.pnpm/`, and checked for `.pnpm` as a direct child of each directory.

**Fix**: 
- Added a second search directory: `process.execPath` (the binary path). In the binary, `process.execPath` points to the actual binary file on disk, so walking up from it finds the workspace.
- Changed the `.pnpm` search to look for `node_modules/.pnpm` (standard pnpm layout) instead of just `.pnpm`.
- Increased the walk depth from 10 to 15 to handle deeper directory structures.

```javascript
const searchDirs = [
    path.dirname(fileURLToPath(import.meta.url)),
    path.dirname(process.execPath),
];
// Walk up looking for node_modules/.pnpm (standard pnpm layout)
// or .pnpm directly (legacy/monorepo layout)
```

### 2. `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js` — `resolveWorkspaceOrImport()`

**Problem**: The function computed `packagesRoot` from `__dirname`, which is wrong in the binary context. It then used this wrong root to construct paths, producing malformed double `@earendil-works/node_modules/@earendil-works/` paths.

**Fix**:
- Added a `workspaceRoot` detection step that walks up from `process.execPath` looking for the workspace (by checking for `apps/tui` directory or `package.json` with the right name).
- Modified `resolveWorkspaceOrImport()` to prefer `workspaceRoot` for workspace-relative paths.
- Changed the node_modules fallback to walk up from `process.execPath` instead of `packagesRoot`.

```javascript
// Determine workspace root by walking up from process.execPath
let workspaceRoot = null;
{
    let dir = path.dirname(process.execPath);
    for (let i = 0; i < 10; i++) {
        const candidate = path.join(dir, "apps", "tui");
        if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
            workspaceRoot = path.join(dir, "apps", "tui");
            break;
        }
        // ... also check for package.json with correct name
    }
}
```

### 3. `apps/tui/tsdown.config.ts` — `build:done` hook

**Problem**: The hook failed when source files didn't exist (e.g., when building from a different directory structure), causing the entire hook to abort and skip copying assets.

**Fix**:
- Added `existsSync()` checks before copying files (for `settings.json` and `system_prompt.md`).
- Fixed the theme source path to search multiple possible locations (direct `node_modules/` path and `.pnpm/` path).
- Fixed the theme destination path from `build/src/modes/interactive/theme/` to `build/dist/modes/interactive/theme/` (matching what the code expects for Node.js dist/ builds).

### 4. `apps/tui/tsdown.config.ts` — Import

Added `existsSync` to the `node:fs` import.

## What Previous Attempts Fixed

### Attempt 1: `settings.json` missing
Fixed by copying `settings.json` into the build output. Different error.

### Attempt 2: `dark.json` theme missing
Fixed by setting `PI_PACKAGE_DIR` and copying theme files. Different error.

### Attempt 3: `(intermediate value).resolve is not a function`
Fixed by patching `import.meta.resolve` in the loader to use multi-tier fallback. Different error.

### Attempt 4: `Cannot find module 'marked'`
Fixed by adding `marked` to the aliases in `getAliases()`. Different error.

### Attempt 5: Improve `resolveTransitive` to prefer standalone packages
Improved `resolveTransitive` to sort and prefer standalone pnpm entries. Different error.

### Attempt 6: `Cannot find module '.'` (directory check)
Added directory check in `resolveExtensionEntries` for `"./"` entries in pi manifests. This was necessary but insufficient — the actual error was from `marked` resolution, not from the `"./"` directory resolution.

## Why This Fix Works

1. `resolveTransitive("marked")` now walks up from BOTH `import.meta.url` AND `process.execPath`
2. It looks for `node_modules/.pnpm` (the actual pnpm layout) instead of just `.pnpm`
3. The walk from `process.execPath` finds the workspace's `node_modules/.pnpm` directory
4. The `marked` alias is correctly set to the resolved path
5. jiti uses the alias to resolve `import { Marked } from "marked"` in `markdown.js`
6. Extensions load successfully

Similarly, `resolveWorkspaceOrImport()` now finds the workspace root from `process.execPath`, so workspace-relative paths are resolved correctly.

## Build Verification

- Build completes successfully (exit code 0)
- Binary runs: `./apps/tui/build/index-darwin-arm64 "hello"` → shows Nexus greeting
- Extensions load without errors (including `@plannotator/pi-extension`)
- `--help` works correctly

## Files Modified

1. `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js` — `resolveTransitive()` and `resolveWorkspaceOrImport()` fixes
2. `apps/tui/tsdown.config.ts` — `build:done` hook robustness and correct paths

## Notes

- The patches to `node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js` are applied to the installed package. Since `@earendil-works/pi-coding-agent` is in `onlyBundle`, tsdown reads the patched file during build and bundles it into the ELF.
- A proper fix would be in the `@earendil-works/pi-coding-agent` package itself, adding `process.execPath` as a fallback for module resolution in bundled binaries.
- The `build:done` hook improvements make the build more robust when running from different directory structures.
- The theme destination path was wrong (`src/` instead of `dist/`), which would have caused a theme loading error even after fixing the extension loading.

## What to Try Next

1. Verify the fix works in CI/CD environments where `process.cwd()` may differ
2. Test with other extensions that use `"./"` in their pi manifest
3. Consider whether the `workspaceRoot` detection is robust enough (currently looks for `apps/tui` or `package.json` with specific names)
4. The `build:done` hook should also handle the theme copying more robustly (the glob `@earendil-works+pi-coding-agent@*` might not work in all cases)
