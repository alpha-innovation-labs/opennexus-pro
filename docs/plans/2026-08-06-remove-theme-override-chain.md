# Plan: Remove All Nexus Theme Overrides — Let Pi Handle Themes End-to-End

## Problem

Nexus has built a parallel theme management system that **overrides and breaks** Pi's native theme lifecycle:

1. **The proxy** (`packages/pi-platform/src/theme.ts`) is a bare object proxy that forwards property reads to `globalThis[THEME_KEY]`. It exists solely to let Nexus code access Pi's theme object without importing Pi directly. It is unused by the TUI renderer — all 8 files that import it are in `extension-core/src/tron/` and use it for text coloring, not theme selection.

2. **`applyNexusConfigPatch`** (`packages/nexus-runtime/src/config/applyNexusConfigPatch.ts`) monkey-patches `SettingsManager.prototype.getTheme()` to return `originalGetTheme() ?? "nexus-black"`. This overrides Pi's theme resolution with a hardcoded fallback. It also rewrites `SettingsManager.create()` to use a stub storage that never reads real settings files.

3. **`readProjectTheme`** (`packages/extension-core/src/slash-menu/readProjectTheme.ts`) reads `projectConfig.theme` from `.nexus/config.json` and falls back to `"nexus-black"`. **Dead code — nobody imports it.**

4. **`applySlashMenuLeaf`** (`packages/extension-core/src/slash-menu/applySlashMenuLeaf.ts`) — when a user selects a theme from the slash menu, it calls a **no-op** `setTheme()` stub and `settings.setTheme()` which only writes to settings but **never calls Pi's `initTheme()`** to actually swap the active theme on `globalThis`.

5. **CLI `themes set`** (`apps/tui/src/cli/themes/setTheme.ts`) writes `theme` to `~/.config/nexus/config.json` — a file Pi never reads for theme selection. Pi reads from `agentDir/settings.json` via `SettingsManager`.

## Goal

Remove every Nexus theme override. Let Pi's `SettingsManager` + `initTheme()` handle theme selection end-to-end. The CLI `themes set` should write to `PI_AGENT_DIR/settings.json` (via `SettingsManager.setTheme()`), and the slash menu should delegate to Pi's own `initTheme()` via `SettingsManager`.

## How Pi's theme system works (the correct path)

1. User selects a theme from the slash menu → `SlashMenuModal.handleEnter()` routes to `applySlashMenuLeaf()` → `applySlashMenuLeaf()` should call Pi's `SettingsManager.setTheme(name)` → Pi's `SettingsManager` writes to `agentDir/settings.json` → Pi calls `initTheme(name)` which sets `globalThis[THEME_KEY]` to a new `Theme` instance → all downstream code that uses `theme.fg()` gets the new colors.

2. The CLI `nexus themes set <name>` should similarly call `SettingsManager.create(cwd).setTheme(name)` which writes to `agentDir/settings.json` and triggers Pi's internal theme reload.

## Changes

### 1. Delete `packages/pi-platform/src/theme.ts` (the proxy)

**8 files import it:**
- `packages/extension-core/src/tron/skill-invocation/renderSkillInvocationMessage.ts`
- `packages/extension-core/src/tron/thinking/ThinkingLabelBlock.ts`
- `packages/extension-core/src/tron/thinking/installAssistantThinkingStyle.ts`
- `packages/extension-core/src/tron/user-message/colorContent.ts`
- `packages/extension-core/src/tron/user-message/colorPrefix.ts`
- `packages/extension-core/src/tron/user-message/colorBorder.ts`
- `packages/extension-core/src/tron/transcript/renderTranscriptEntry.ts`
- `packages/extension-core/src/tron/compact-tool-lines/CollapsedToolGroupCall.ts`

**Action:** Replace `import { theme } from "@nexus/pi-platform/theme.js"` with `import { theme } from "@earendil-works/pi-coding-agent"` (Pi re-exports the proxy directly). These files only use `theme.fg()`, `theme.bold()`, etc. — they don't need the Nexus proxy at all.

### 2. Delete `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts`

This file does three things, all of which must be removed:

a. **`SettingsManager.prototype.getTheme` override** (line 99-101): Patches `getTheme()` to return `originalGetTheme() ?? "nexus-black"`. **Remove.** Pi's `getTheme()` already works.

b. **`SettingsManager.create` override** (line 103-116): Rewrites `create()` to use a stub storage that never reads real files. **Remove.** Pi's `create()` reads from `agentDir/settings.json` natively.

c. **`fromStorage` override** (line 44-96): Merges app defaults, converts `pi_packages` format, clears extensions. **Remove.** This is part of the same patch — if we remove the patch, this whole block goes.

**Action:** Delete the entire file. Remove all imports of `applyNexusConfigPatch` from:
- `apps/tui/src/runtime/runApp.ts` (line 19, 72-73)
- `apps/tui/src/cli/pi-packages/runPiPackagesCommand.ts` (line 2, 43)
- `apps/tui/src/cli/install/runInstallCommand.ts` (line 2, 39)
- `apps/tui/src/cli/uninstall/runUninstallCommand.ts` (line 2, 41)

### 3. Delete `packages/extension-core/src/slash-menu/readProjectTheme.ts`

**Action:** Delete the file. It is dead code — nobody imports it.

### 4. Fix `packages/extension-core/src/slash-menu/applySlashMenuLeaf.ts`

**Current (lines 6-34):** Calls a no-op `setTheme()` stub and `settings.setTheme()` which does not trigger Pi's `initTheme()`.

**Action:** Replace with:
```typescript
import { SettingsManager } from "@earendil-works/pi-coding-agent";

export async function applySlashMenuLeaf(
  ctx: ExtensionContext,
  leaf: SlashMenuLeaf,
  setThinkingLevel: (value: string) => void,
): Promise<string> {
  const settings = SettingsManager.create(ctx.cwd);
  const current = leaf.currentValue ?? "";
  const options = leaf.options ?? [];
  const currentIndex = Math.max(0, options.indexOf(current));
  const nextValue = options[(currentIndex + 1) % options.length] ?? current;

  if (leaf.kind === "theme" && leaf.value !== "theme") {
    settings.setTheme(nextValue);
    return `theme set to ${nextValue}`;
  }

  return applySlashMenuSettingValue(ctx, leaf, nextValue, setThinkingLevel);
}
```

Key change: `settings.setTheme(nextValue)` calls Pi's real implementation which writes to `agentDir/settings.json` and triggers `initTheme()` internally.

### 5. Fix CLI `apps/tui/src/cli/themes/setTheme.ts`

**Current:** Writes `theme` to `~/.config/nexus/config.json` — a file Pi never reads for themes.

**Action:** Replace with:
```typescript
import { SettingsManager } from "@earendil-works/pi-coding-agent";
import { DefaultResourceLoader } from "@earendil-works/pi-coding-agent";
import { getNexusAgentDirPath } from "@nexus/runtime/config/getNexusAgentDirPath.js";

export async function setTheme(themeName: string): Promise<number> {
  const loader = new DefaultResourceLoader({
    cwd: process.cwd(),
    agentDir: getNexusAgentDirPath(),
    noThemes: false,
  });
  await loader.reload();

  const { themes } = loader.getThemes();
  const names = themes.map((t) => t.name).filter((n): n is string => typeof n === "string");
  if (!names.includes(themeName)) {
    console.error(`Error: unknown theme "${themeName}"`);
    console.error(`Available themes: ${[...new Set(names)].sort().join(", ")}`);
    return 1;
  }

  const settings = SettingsManager.create(process.cwd());
  settings.setTheme(themeName);
  console.log(`Theme set to "${themeName}"`);
  return 0;
}
```

Key change: Uses `SettingsManager.create().setTheme()` instead of writing to `~/.config/nexus/config.json`.

### 6. Update `apps/tui/src/cli/themes/listThemes.ts`

**Current:** Reads `theme` from `~/.config/nexus/config.json` to determine the current theme.

**Action:** Use `SettingsManager.create(process.cwd()).getTheme()` instead:
```typescript
import { SettingsManager } from "@earendil-works/pi-coding-agent";
import { DefaultResourceLoader } from "@earendil-works/pi-coding-agent";
import { getNexusAgentDirPath } from "@nexus/runtime/config/getNexusAgentDirPath.js";

export async function listThemes(): Promise<{ themes: string[]; currentTheme: string }> {
  const loader = new DefaultResourceLoader({
    cwd: process.cwd(),
    agentDir: getNexusAgentDirPath(),
    noThemes: false,
  });
  await loader.reload();

  const { themes } = loader.getThemes();
  const names = themes.map((t) => t.name).filter((n): n is string => typeof n === "string");

  const settings = SettingsManager.create(process.cwd());
  const currentTheme = settings.getTheme() || "nexus-black";

  return {
    themes: [...new Set(names)].sort((left, right) => left.localeCompare(right)),
    currentTheme,
  };
}
```

### 7. Delete `packages/nexus-runtime/src/config/getDefaultThemeName.ts`

**Action:** Delete the file. It returns `"nexus-black"` as a hardcoded fallback. Without `applyNexusConfigPatch`, there is no consumer of this function.

### 8. Remove `printThemesHelp.ts` update

**Current:** Says `nexus themes set <theme-name>` writes to `.nexus/config.json`.

**Action:** Update the help text to remove the `.nexus/config.json` reference.

### 9. Remove `readProjectConfig` import from `applySlashMenuLeaf.ts`

**Action:** Since `applyNexusConfigPatch` is deleted, the `readProjectConfig` import in `applySlashMenuLeaf.ts` (if any) should be removed.

## Files to modify

| File | Action |
|---|---|
| `packages/pi-platform/src/theme.ts` | **Delete** — the proxy. Replace imports with Pi's re-export. |
| `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts` | **Delete** — the entire monkey-patch. |
| `packages/extension-core/src/slash-menu/readProjectTheme.ts` | **Delete** — dead code. |
| `packages/nexus-runtime/src/config/getDefaultThemeName.ts` | **Delete** — no consumer without the patch. |
| `packages/extension-core/src/slash-menu/applySlashMenuLeaf.ts` | **Fix** — call `settings.setTheme()` directly, remove no-op stub. |
| `apps/tui/src/cli/themes/setTheme.ts` | **Fix** — use `SettingsManager.create().setTheme()` instead of writing to `~/.config/nexus/config.json`. |
| `apps/tui/src/cli/themes/listThemes.ts` | **Fix** — use `SettingsManager.create().getTheme()` instead of reading `~/.config/nexus/config.json`. |
| `apps/tui/src/cli/themes/printThemesHelp.ts` | **Fix** — update help text. |
| `apps/tui/src/runtime/runApp.ts` | **Remove** `applyNexusConfigPatch` import + call. Remove the theme print line added in the previous plan. |
| `apps/tui/src/cli/pi-packages/runPiPackagesCommand.ts` | **Remove** `applyNexusConfigPatch` import + call. |
| `apps/tui/src/cli/install/runInstallCommand.ts` | **Remove** `applyNexusConfigPatch` import + call. |
| `apps/tui/src/cli/uninstall/runUninstallCommand.ts` | **Remove** `applyNexusConfigPatch` import + call. |
| `packages/extension-core/src/tron/skill-invocation/renderSkillInvocationMessage.ts` | **Fix** — import `theme` from Pi instead of `@nexus/pi-platform/theme.js`. |
| `packages/extension-core/src/tron/thinking/ThinkingLabelBlock.ts` | **Fix** — import `theme` from Pi. |
| `packages/extension-core/src/tron/thinking/installAssistantThinkingStyle.ts` | **Fix** — import `theme` from Pi. |
| `packages/extension-core/src/tron/user-message/colorContent.ts` | **Fix** — import `theme` from Pi. |
| `packages/extension-core/src/tron/user-message/colorPrefix.ts` | **Fix** — import `theme` from Pi. |
| `packages/extension-core/src/tron/user-message/colorBorder.ts` | **Fix** — import `theme` from Pi. |
| `packages/extension-core/src/tron/transcript/renderTranscriptEntry.ts` | **Fix** — import `theme` from Pi. |
| `packages/extension-core/src/tron/compact-tool-lines/CollapsedToolGroupCall.ts` | **Fix** — import `theme` from Pi. |

## Files to verify still work

- `packages/extension-core/src/slash-menu/createThemeLeaves.ts` — calls `SettingsManager.create(cwd).getTheme()` and `readThemeNames(cwd)`. Should work as-is since `SettingsManager` is no longer patched.
- `packages/extension-core/src/slash-menu/createActiveLeaves.ts` — imports `createThemeLeaves`. No change needed.
- `packages/extension-core/src/slash-menu/SlashMenuModal.ts` — routes theme selection to `applySlashMenuLeaf`. No change needed.
- `packages/extension-core/src/slash-menu/createSettingsLeaves.ts` — imports `SettingsManager`. No change needed.
- `packages/assets/src/themes/getBundledThemesPath.ts` — still used by `copyBundledThemes`. No change needed.
- `packages/nexus-runtime/src/config/copyBundledThemes.ts` — copies bundled themes into `agentDir/.themes/`. **Keep** — this is needed so Pi discovers themes natively.
- `scripts/release/binary/copyPiThemeAssets.mjs` — release script copies Pi's bundled themes into the binary bundle. No change needed.

## Risk assessment

- **Medium risk:** Removing `applyNexusConfigPatch` means Nexus stops patching `SettingsManager`. If Pi's `getTheme()` or `setTheme()` behavior changes, that's on Pi. However, this is the desired outcome — we want Nexus to stop interfering.
- **Low risk:** The 8 tron files that import the proxy only use `theme.fg()`, `theme.bold()`, etc. These are color methods on Pi's `Theme` class, not Nexus-specific. Replacing the import with Pi's direct re-export is safe.
- **Medium risk:** `SettingsManager.setTheme()` must internally call Pi's `initTheme()` to swap the active theme. If Pi's implementation only writes to settings without triggering `initTheme()`, theme changes won't take effect until the next session. This needs verification against Pi's source.
- **Low risk:** CLI `themes set` and `themes list` use `SettingsManager` which now reads from the real `agentDir/settings.json`. This is the correct behavior.

## Rollback plan

If removing the patch causes regressions:
1. Re-add `applyNexusConfigPatch` (git restore).
2. Re-add the proxy (git restore `packages/pi-platform/src/theme.ts`).
3. Re-add the CLI writing to `~/.config/nexus/config.json`.

The proxy can be restored as a simple re-export of Pi's proxy without Nexus-specific logic if needed.
