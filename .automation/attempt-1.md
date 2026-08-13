# Attempt 1

## Error

```
Error: ENOENT: no such file or directory, open '/Users/alpha/workspace/alpha-innovation-labs/__nexus/nexus-tui-awesome/apps/tui/build/default-settings/settings.json'
```

## Root Cause Analysis

The error occurs because the TUI binary (built with tsdown + `exe: true`) calls `getBundledDefaultSettingsPath()` from `@nexus/runtime`. This function resolves the path to `default-settings/settings.json` relative to `import.meta.url`.

### How `getBundledDefaultSettingsPath` works

The function in `packages/nexus-runtime/src/config/getBundledDefaultSettingsPath.ts`:

1. Checks `process.env.PI_PACKAGE_DIR` — if set, returns a path inside that directory.
2. Falls back to `${dirname(fileURLToPath(import.meta.url))}/default-settings/settings.json` — source-relative path.

### Why it fails in the bundled binary

- The TUI is built with **tsdown** (not Bun), so `isBundledBinary()` returns `false`.
- `ensureEmbeddedPackageDirEnv()` also checks `isBundledBinary()` and returns early without setting `PI_PACKAGE_DIR`.
- So `PI_PACKAGE_DIR` is never set at runtime.
- The fallback path resolves to `build/default-settings/settings.json` (since the bundled module's `import.meta.url` points into the `build/` directory).
- The file does not exist because the `build:done` hook only copies `prompts/system_prompt.md`, not `default-settings/settings.json`.

### Why `resolveBundledAssetPath` is not used

Other path functions like `getBundledThemesPath()` and `getBundledCommandsPath()` use `resolveBundledAssetPath()`, which delegates to `getBinaryPackageDir()`. That function also returns `null` for tsdown builds (same `isBundledBinary` issue), so it falls back to source-relative paths. The `copyBundledThemes()` function handles this by catching `ENOENT` and returning early. But `readBundledDefaultSettings()` calls `readFileSync` directly on the path from `getBundledDefaultSettingsPath()` — no try/catch, so it throws.

## What Was Changed

Updated `apps/tui/tsdown.config.ts` to copy `default-settings/settings.json` to the build output directory in the `build:done` hook. The hook now:

1. Copies `packages/nexus-runtime/src/config/default-settings/settings.json` → `build/default-settings/settings.json`
2. Copies `prompts/base-system-prompt/system_prompt.md` → `build/prompts/system_prompt.md` (existing behavior, moved into the same block for clarity)

## Why This Fix Works

The `getBundledDefaultSettingsPath()` function falls back to `${selfDir}/default-settings/settings.json`. With the file now present in `build/default-settings/settings.json`, the path resolves correctly at runtime.

## What to Try Next

Run the build (`just dev build` or `just dev release`) and test the binary to confirm the error is gone. If it still fails, check whether `@earendil-works/pi-coding-agent` (which is also bundled via `onlyBundle`) has its own copy of the `getBundledDefaultSettingsPath` function that resolves a different path.
