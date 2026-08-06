# Plan: Native Pi Theme Loading via PI_CODING_AGENT_DIR/.themes

## Problem

Nexus currently reimplements theme loading through a monkey-patch of `DefaultResourceLoader.prototype.loadThemes` in `applyNexusConfigPatch.ts`. The patch:

1. Calls `originalLoadThemes(paths, false)` — passing `includeDefaults = false`
2. Manually loads from `getUserThemesPath()` and `getProjectThemesPath(cwd)` only
3. Injects bundled themes via CLI `--theme <bundledThemesPath>` in `createAppArgs.ts`

This **disables** Pi's native theme discovery from `agentDir/.themes/`, which is exactly the mechanism we want to use.

## Goal

Stop reimplementing theme loading. Let Pi natively discover and load themes from `PI_CODING_AGENT_DIR/.themes/`. Nexus only needs to **list** available themes for the slash menu — not override or duplicate Pi's loading logic.

## Pi's native behavior

Pi's `DefaultResourceLoader.loadThemes()` (in `node_modules/@earendil-works/pi-coding-agent/dist/core/resource-loader.js`, line 667-673) already does this when `includeDefaults = true`:

```js
const defaultDirs = [
  join(this.agentDir, "themes"),      // PI_CODING_AGENT_DIR/.themes/
  join(this.cwd, CONFIG_DIR_NAME, "themes"),  // <cwd>/.nexus/themes/
];
for (const dir of defaultDirs) {
  this.loadThemesFromDir(dir, themes, diagnostics);
}
```

If we copy `nexus-black.json` into `PI_CODING_AGENT_DIR/.themes/`, Pi will pick it up automatically.

## Changes

### 1. Remove the `loadThemes` patch

**File:** `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts`

**Lines 130-153:** Remove the entire `resourceLoaderPrototype.loadThemes` override block.

This block currently:
- Calls `originalLoadThemes.call(this, paths, false)` (disabling defaults)
- Manually loads from `getUserThemesPath()` and `getProjectThemesPath(this.cwd)`

Both of these paths are already covered by Pi's native behavior:
- `getUserThemesPath()` → `~/.config/nexus/themes/` — this is the **user** themes dir, which Pi reads from `agentDir/themes/` when `agentDir` points to the user config dir.
- `getProjectThemesPath(cwd)` → `<cwd>/.nexus/themes/` — Pi reads this from `<cwd>/.nexus/themes/` natively.

The patch is redundant and actively harmful because it passes `includeDefaults = false`.

### 2. Copy bundled themes into PI_CODING_AGENT_DIR/.themes/

**New file:** `packages/nexus-runtime/src/config/copyBundledThemes.ts` (or similar)

On Nexus startup (or during release), copy all `.json` theme files from `getBundledThemesPath()` into `join(getNexusAgentDirPath(), "themes/")`.

This ensures `nexus-black.json` (and any future bundled themes) are discoverable by Pi's native loader.

### 3. Update slash menu to read from agentDir

**File:** `packages/extension-core/src/slash-menu/readThemeNames.ts`

**Current:** Reads from `getBundledThemesPath()` and `getProjectThemesPath(cwd)`.

**Change:** Also read from `join(getNexusAgentDirPath(), "themes")` so the slash menu shows themes discovered by Pi's native loader (including user-placed themes in `agentDir/.themes/`).

### 4. Remove CLI `--theme` injection for bundled themes

**File:** `apps/tui/src/cli/createAppArgs.ts`

**Lines 16-17, 21-22, 38:** Remove the bundled themes path injection logic.

The `--theme <bundledThemesPath>` prepend is no longer needed because themes live in `agentDir/.themes/` and Pi discovers them natively.

The `--no-themes` flag can remain for users who want to disable theme loading entirely (that flag sets `noThemes = true` on the resource loader, which is Pi's built-in mechanism).

### 5. Keep `getDefaultThemeName()` fallback

**File:** `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts` (line 111-113)

This is a separate concern — it patches `SettingsManager.prototype.getTheme()` to return `nexus-black` as the fallback. This is fine to keep since it only affects the "current theme" display, not theme loading.

## Files to modify

| File | Action |
|---|---|
| `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts` | Remove lines 130-153 (loadThemes patch). Keep lines 111-113 (getTheme fallback). |
| `packages/nexus-runtime/src/config/copyBundledThemes.ts` | **New** — copies bundled `.json` themes into `agentDir/.themes/`. |
| `packages/extension-core/src/slash-menu/readThemeNames.ts` | Add `join(getNexusAgentDirPath(), "themes")` to the directory scan. |
| `apps/tui/src/cli/createAppArgs.ts` | Remove bundled themes path injection (lines 16-17, 21-22, 38). |
| `packages/assets/src/themes/getBundThemesPath.ts` | No change needed — still used by copy script. |
| `packages/pi-platform/src/theme.ts` | No change — re-exports Pi's `initTheme` and `theme` Proxy. |

## Files to verify still work

- `packages/extension-core/src/slash-menu/createThemeLeaves.ts` — currently stubs `getAvailableThemes()` returning `["dark", "light"]`. This should be updated to use `readThemeNames()` instead.
- `scripts/release/binary/copyPiThemeAssets.mjs` — release script copies Pi's bundled themes into the binary bundle. This is still needed for the bundled themes directory; the new `copyBundledThemes` script reads from that bundled directory and copies to `agentDir/.themes/`.

## Risk assessment

- **Low risk:** Removing the `loadThemes` patch means Nexus stops managing theme loading. If Pi's native loader has a bug, that's Pi's bug to fix.
- **Low risk:** The slash menu `readThemeNames()` is a display-only concern.
- **Medium risk:** If `PI_CODING_AGENT_DIR` is not set during development (e.g., running from source), the agent dir defaults to `~/.local/share/nexus/agent`. Ensure this directory exists and has a `themes/` subdirectory before copying.

## Rollback plan

If the native loading approach causes issues, the `loadThemes` patch can be restored. The CLI `--theme` injection is a safe fallback since it explicitly points Pi at a themes directory regardless of where themes live.
