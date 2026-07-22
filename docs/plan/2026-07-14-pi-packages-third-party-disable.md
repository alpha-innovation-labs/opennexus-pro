# Plan: Sync Nexus user extension config into Pi settings for third-party packages

## Problem

Disabling a third-party package via `/pi-packages` has no effect at runtime.

### Two separate config systems

| System | Location | Managed by |
|---|---|---|
| Nexus user config | `~/.config/nexus/settings.json` | Nexus CLI, `/pi-packages` toggle |
| Pi settings | `~/.pi/agent/settings.json` | Pi's `PackageManager`, `SettingsManager` |

When you toggle a third-party package as "disabled" in `/pi-packages`:

1. **`setUserExtensionEnabled("pi-chrome", false)`** writes to Nexus user config:
   ```json
   { "extensions": { "pi-chrome": { "enabled": false } } }
   ```

2. On Nexus boot, `applyUserExtensionConfig()` reads this config and **only** overrides the bundled feature-flags config for extensions that exist in `compiledFeatureFlags.ts`. Third-party package names never appear in that file.

3. Pi's `PackageManager.resolve()` reads packages from **Pi's settings** (`~/.pi/agent/settings.json` → `globalSettings.packages` / `projectSettings.packages`) and resolves all of them. Pi never reads `~/.config/nexus/settings.json`.

**Result:** The disable toggle is written to Nexus config but never communicated to Pi. All third-party packages always load.

### Bundled extensions work because Nexus intercepts them

Bundled extensions go through Nexus's `registerCompiledEnabledExtensions()`, which checks `config.extensions[id]?.enabled` and skips the registration call entirely. Third-party packages bypass this entirely — they are loaded by Pi's `ResourceLoader` during `PackageManager.resolve()`.

## Solution

Patch Pi's settings loading in `applyNexusConfigPatch()` to sync Nexus user extension enablement overrides into Pi's settings `packages` entries.

### Design

Pi's `settings.json` stores packages as either strings or objects:
```json
{ "packages": [
    "npm:pi-chrome",
    { "source": "npm:pi-provider-litellm", "extensions": ["chrome"], "skills": [] }
]}
```

When a package is an object, it can carry `extensions`, `skills`, `prompts`, `themes` arrays — but **no `enabled` field**.

The fix: when Nexus patches Pi's settings, for every package entry, check if Nexus user config has `extensions.<source>.enabled === false`. If so, convert that package entry to an object with an `enabled: false` marker (or use a filter pattern) so Pi's `PackageManager` skips it.

### Approach: Filter pattern via package object

Pi already supports object-style packages with filter fields (`extensions`, `skills`, `prompts`, `themes`). We can add a synthetic filter: if a package's `extensions` array is empty (or a specific marker), Pi's `collectPackageResources` won't find any extension files to load, effectively disabling it.

However, a cleaner approach is to modify how Pi resolves packages: if Nexus marks a package as disabled, we remove it from Pi's `settings.packages` list entirely during the patch, so Pi's `PackageManager.listConfiguredPackages()` and `resolve()` never see it.

### Implementation steps

#### Step 1: Create a sync function

Create `packages/nexus-runtime/src/config/syncNexusUserExtensionsToPiSettings.ts`:

```ts
import { readNexusUserConfig } from "./readNexusUserConfig.js";
import { getUserSettingsPath } from "./getUserSettingsPath.js";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Reads Nexus user extension preferences and returns a filtered list of
 * Pi package sources that excludes disabled third-party packages.
 *
 * @param piPackages Current packages from Pi settings.
 * @returns Package sources filtered to only enabled packages.
 */
export function filterDisabledPackages(
  piPackages: unknown[],
): unknown[] {
  const userConfig = readNexusUserConfig();
  const disabledSet = new Set<string>(
    Object.entries(userConfig.extensions ?? {})
      .filter(([, pref]) => pref.enabled === false)
      .map(([id]) => id),
  );

  return piPackages.filter((pkg) => {
    const source = typeof pkg === "string" ? pkg : pkg.source;
    const name = normalizeNpmPackageName(source);
    return !disabledSet.has(name);
  });
}

/**
 * Normalizes a package source to the extension-id Nexus uses.
 * Strips `npm:`, `git:` prefixes and scope qualifiers.
 */
function normalizeNpmPackageName(source: string): string {
  return source
    .replace(/^npm:/, "")
    .replace(/^git:/, "");
}
```

#### Step 2: Patch `applyNexusConfigPatch()` to inject filtered packages

Modify `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts` to inject the filtered packages into the settings object after `fromStorage` returns:

```ts
import { filterDisabledPackages } from "./syncNexusUserExtensionsToPiSettings.js";
// ... existing imports

patchedSettingsManager.fromStorage = function fromStorageWithNexusDefaults(storage: unknown) {
  const manager = originalFromStorage.call(this, storage) as unknown as NexusSettingsManagerInstance;
  manager.globalSettings = mergeSettings(appDefaults, manager.globalSettings);
  manager.settings = mergeSettings(manager.globalSettings, manager.projectSettings);

  // Sync Nexus user extension disable flags into Pi settings packages
  const filteredPackages = filterDisabledPackages(manager.globalSettings.packages);
  manager.globalSettings.packages = filteredPackages;
  manager.settings = mergeSettings(manager.globalSettings, manager.projectSettings);

  return manager;
};
```

#### Step 3: Update the `/pi-packages` modal to also update Pi settings

Currently, the modal only writes to Nexus config. After the above patch, disabling a package in Nexus config will take effect on next restart. But for immediate effect (same session), we should also update Pi's settings:

Modify `packages/extension-core/src/pi-packages/command/showPiPackagesModal.ts`:

```ts
function updateExtension(extensionId: string, enabled: boolean) {
  setUserExtensionEnabled(extensionId, enabled);
  // Also update Pi settings for immediate effect
  syncPackageToPiSettings(extensionId, enabled);
  rows = updateManagedExtensionRows(rows, extensionId, enabled ? "enabled" : "disabled");
  return rows;
}
```

Create a helper `syncPackageToPiSettings` that reads Pi's current settings, removes or restores the package entry, and calls `manager.setPackages()`.

#### Step 4: Write tests

- Unit test: `filterDisabledPackages` correctly excludes disabled packages
  - See `test/e2e/pi-packages/thirdPartyDisable.test.ts`
- Unit test: `filterDisabledPackages` preserves enabled packages and object-style packages
  - See `test/e2e/pi-packages/thirdPartyDisable.test.ts`
- **Agent-tui E2E test (enabled):** `test/e2e/pi-packages/checkChromeCommand.test.ts`
  - Launches Nexus in a real agent-tui session, types `/chrome`, dumps the ANSI output, and asserts whether the `/chrome` command is registered.
  - This is the baseline: with `pi-chrome` enabled, `/chrome` should render the Chrome connection modal.
  - Run with: `npx tsx --test test/e2e/pi-packages/checkChromeCommand.test.ts`
- **Agent-tui E2E test (disabled):** `test/e2e/pi-packages/checkChromeCommandDisabled.test.ts`
  - Same flow as above, but after disabling `pi-chrome` via `/pi-packages` and restarting Nexus.
  - Asserts that `/chrome` does NOT render (no "Chrome" or "Authori" text in the dump).
  - Run with: `npx tsx --test test/e2e/pi-packages/checkChromeCommandDisabled.test.ts`

Both tests are correctly written and exercise the full user flow (create session → launch Nexus → type slash command → dump pane output → assert). **Their failure is expected until the implementation work is complete.** The tests are the ground truth — if they fail, the implementation code must be updated to make them pass. The tests are not the agent's responsibility to change; only the implementation code is.
- E2E test: `/pi-packages` disables a third-party package → restart Nexus → package no longer loads
- E2E test: `/pi-packages` re-enables a disabled third-party package → restart Nexus → package loads

### Files to modify

| File | Change |
|---|---|
| `packages/nexus-runtime/src/config/syncNexusUserExtensionsToPiSettings.ts` | **New** — filter function |
| `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts` | Inject filtered packages into `fromStorage` |
| `packages/extension-core/src/pi-packages/command/showPiPackagesModal.ts` | Call sync helper on toggle |
| `test/feature-flags/syncNexusUserExtensionsToPiSettings.test.ts` | **New** — unit tests |
| `test/e2e/pi-packages/thirdPartyDisable.test.ts` | **Existing** — unit-style e2e tests |
| `test/e2e/pi-packages/checkChromeCommand.test.ts` | **New** — agent-tui e2e dump (enabled baseline) |
| `test/e2e/pi-packages/checkChromeCommandDisabled.test.ts` | **New** — agent-tui e2e dump (disabled verification) |

### Risk assessment

- **Low risk:** The patch only filters packages; it doesn't change how Pi resolves or loads them. If the filter is empty (no Nexus config), behavior is unchanged.
- **Edge case:** If a user manually edits `~/.pi/agent/settings.json` to add a package, the filter will re-apply on next Nexus boot. If Nexus config doesn't have an explicit enable flag for it, the package loads (default behavior). This is correct.
- **Edge case:** If a third-party package name doesn't match Nexus's normalized extension ID, the filter won't catch it. The `normalizeNpmPackageName` function handles this by stripping prefixes, matching how `createConfiguredPackageRows` normalizes names for the modal display.
