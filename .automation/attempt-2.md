# Attempt 2

## Error

```
Error: ENOENT: no such file or directory, open '/Users/alpha/workspace/alpha-innovation-labs/__nexus/nexus-tui-awesome/apps/tui/src/modes/interactive/theme/dark.json'
```

## Root Cause Analysis

### How `@earendil-works/pi-coding-agent` resolves theme paths

The `@earendil-works/pi-coding-agent` package (bundled via `onlyBundle` in tsdown) has two key functions:

1. **`getPackageDir()`** — Walks up from `__dirname` looking for `package.json`. If found, returns that directory. Falls back to `__dirname`.

2. **`getThemesDir()`** — Calls `getPackageDir()`, then checks if `<packageDir>/src` exists. If yes, returns `<packageDir>/src/modes/interactive/theme/`. Otherwise returns `<packageDir>/dist/modes/interactive/theme/`.

### Why the path resolves to `apps/tui/src/modes/interactive/theme/`

When the tsdown-built binary runs:
- `__dirname` = `apps/tui/build/` (the build output directory)
- `getPackageDir()` walks up from `build/` and finds `apps/tui/package.json`
- So `packageDir` = `apps/tui/`
- `getThemesDir()` checks `apps/tui/src` — it exists (it is the source tree)
- So it returns `apps/tui/src/modes/interactive/theme/dark.json`
- The file does not exist at that path (it lives in `node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/theme/`)

### Why attempt-1's fix did not resolve this

Attempt-1 fixed a different issue: `settings.json` missing. The `build:done` hook was updated to copy `settings.json` to `build/default-settings/settings.json`. This resolved the first error but not the theme error.

The theme error is a separate problem. The `@earendil-works/pi-coding-agent` package is bundled into the binary, but its bundled code still tries to read theme files from disk relative to `__dirname`.

### Why `PI_PACKAGE_DIR` was not set

`ensureEmbeddedPackageDirEnv()` in `@nexus/runtime` only sets `PI_PACKAGE_DIR` for Bun-compiled binaries (it checks `isBundledBinary()` which returns `true` only when `process.versions.bun` is present and the import URL contains Bun virtual filesystem markers like `$bunfs`).

For tsdown builds, `isBundledBinary()` returns `false` (no Bun markers), so `PI_PACKAGE_DIR` is never set. The `@earendil-works/pi-coding-agent` code then falls back to the `__dirname`-walking behavior described above.

## What Was Changed

### 1. `packages/nexus-runtime/src/package/embedded-assets/ensureEmbeddedPackageDirEnv.ts`

Added a new `isTsdownBundledBinary()` helper function that detects tsdown-built binaries by checking if `import.meta.url` points inside a `/build/` or `/dist/` directory.

Modified `ensureEmbeddedPackageDirEnv()` to also handle tsdown builds:
- If `isTsdownBundledBinary()` returns true, sets `PI_PACKAGE_DIR` to the build directory (parent of the current module file)
- This overrides the `__dirname`-walking behavior in bundled packages

### 2. `apps/tui/tsdown.config.ts`

Updated the `build:done` hook to copy bundled theme JSON files (dark.json, light.json) from `@earendil-works/pi-coding-agent` to `build/src/modes/interactive/theme/`.

The destination path matches the expected layout:
- `PI_PACKAGE_DIR` = `build/` (set by `ensureEmbeddedPackageDirEnv`)
- `getThemesDir()` looks for `<PI_PACKAGE_DIR>/src/modes/interactive/theme/`
- Theme files are copied there during build

Added a guard: if the source theme directory does not exist (e.g. pnpm workspace layout), skip copying instead of failing.

## Why This Fix Works

1. `ensureEmbeddedPackageDirEnv()` sets `PI_PACKAGE_DIR=build/` for tsdown builds
2. `getPackageDir()` in `@earendil-works/pi-coding-agent` reads `PI_PACKAGE_DIR` first, so it returns `build/` instead of walking up to `apps/tui/`
3. `getThemesDir()` checks `build/src` (which we created in `build:done`), finds it exists, and returns `build/src/modes/interactive/theme/`
4. The theme files (dark.json, light.json) are present at that path

## Build Verification

- Build completes successfully (exit code 0)
- Theme files are copied: `build/src/modes/interactive/theme/dark.json` and `light.json`
- Binary runs without the dark.json ENOENT error
- `--help` works, `--no-extensions "hello"` fails only on API key (expected, unrelated)

## What to Try Next

- Test the binary with actual extension loading (resolve the extension loading errors)
- Verify the fix works in CI/CD environments where `process.cwd()` may differ
- Consider whether the `isTsdownBundledBinary` detection is robust enough (currently checks for `/build/` or `/dist/` in the URL path)
