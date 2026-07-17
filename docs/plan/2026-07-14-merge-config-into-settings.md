# Plan: Merge `config.json` into `settings.json` and deprecate `config.json`

## Problem

Nexus maintains **two separate global user config files** in `~/.config/nexus/`:

| File | Current purpose | Managed by |
|---|---|---|
| `settings.json` | Pi runtime settings (themes, packages) — patched from `~/.pi/agent/settings.json` | Pi's `SettingsManager`, `PackageManager`, Nexus config patch |
| `config.json` | Nexus user preferences (extension toggles, mini-app state, package sources) | Nexus CLI, `readNexusUserConfig`, `writeNexusUserConfig` |

This creates:
- **Dual persistence** — toggling an extension writes to `config.json` but Pi reads packages from `settings.json`. The sync workaround in `2026-07-14-pi-packages-third-party-disable.md` bridges them but adds complexity.
- **Two file I/O paths** for user config — boot reads from both files, writes go to different files.
- **Migration burden** — any new user preference must be decided: "does it go in settings or config?"

## Goal

Consolidate all Nexus user preferences into **`~/.config/nexus/settings.json`** (Pi's settings file, redirected by Nexus). Remove `~/.config/nexus/config.json` entirely. Every reader of `readNexusUserConfig()` will instead read from `settings.json`.

## Design

### `settings.json` final shape

```json
{
  "theme": "dark",
  "packages": ["npm:pi-chrome", ...],
  "extensions": {
    "memory": { "enabled": false },
    "social-chat": { "enabled": true }
  },
  "miniApps": {
    "tetris": { "musicEnabled": false, "fullscreen": true },
    "automations": { "dbPath": "/path/to/db" }
  },
  "packages": [
    { "source": "npm:pi-provider-litellm", "extensions": ["chrome"] }
  ]
}
```

The file keeps Pi's existing keys (`theme`, `packages`) and adds Nexus user preference keys (`extensions`, `miniApps`).

### What changes

1. **`readNexusUserConfig()`** — redirect from `config.json` to `settings.json`.
2. **`writeNexusUserConfig()`** — redirect from `config.json` to `settings.json`.
3. **`setUserExtensionEnabled()`** — no change (reads/writes via the above).
4. **`removeUserExtensionConfig()`** — no change (reads/writes via the above).
5. **`applyUserExtensionConfig()`** — no change (reads via the above).
6. **Mini-app readers** (`readTetrisSettings`, `readNexusMemorySettings`, `getAutomationDbPath`) — redirect `readNexusUserConfig` callers to the new unified path.
7. **`readNexusMemorySettings()`** — this is a special case. It reads `settings.json` directly (not via `readNexusUserConfig`). It needs to be removed or merged into the unified reader.
8. **`applyNexusConfigPatch()`** — already redirects Pi's `FileSettingsStorage` to `settings.json`. No change needed; the sync workaround from the third-party-disable plan continues to work because both files are now the same file.
9. **`neo-editor refreshTransportPreference`** — reads `settings.json` directly (not via `readNexusUserConfig`). No change needed; it already reads the right file.
10. **`slash-menu readGlobalSettings`** — reads `settings.json` directly. No change needed.

### What stays the same (no file changes needed)

- `applyNexusConfigPatch.ts` — already points Pi to `settings.json`.
- `neo-editor refreshTransportPreference.ts` — reads `settings.json` directly for transport preferences.
- `slash-menu readGlobalSettings.ts` / `writeProjectSettings.ts` — reads/writes `settings.json` / `.nexus/settings.json` directly.
- Pi's `SettingsManager` — reads `settings.json` as global settings.

### What must be removed

- `getUserConfigPath()` — the function that resolves `~/.config/nexus/config.json`.
- `readNexusUserConfig()` — replaces with a reader that reads `settings.json` and extracts Nexus keys.
- `writeNexusUserConfig()` — replaces with a writer that reads existing `settings.json`, merges Nexus keys, and writes back.
- All references to `~/.config/nexus/config.json` in tests, docs, and e2e tests.
- `NexusUserConfig` type can stay — it describes the Nexus portion of `settings.json`.

## Implementation steps

### Step 1: Rewrite `readNexusUserConfig()` to read from `settings.json`

**File:** `packages/nexus-runtime/src/config/readNexusUserConfig.ts`

```ts
import { existsSync, readFileSync } from "node:fs";
import { getUserSettingsPath } from "./getUserSettingsPath.js";
import type { NexusUserConfig } from "./types.js";

/**
 * Reads the Nexus user preferences from the global settings file.
 *
 * Extracts `extensions` and `miniApps` keys from `~/.config/nexus/settings.json`
 * and returns them as a `NexusUserConfig`. Returns an empty config when the
 * file does not exist or contains no Nexus keys.
 *
 * @returns Parsed Nexus user config, or an empty config when none exists.
 */
export function readNexusUserConfig(): NexusUserConfig {
  if (!existsSync(getUserSettingsPath())) return {};

  const raw = JSON.parse(readFileSync(getUserSettingsPath(), "utf8")) as Record<string, unknown>;
  return {
    extensions: raw.extensions as Record<string, { enabled?: boolean }> | undefined,
    miniApps: raw.miniApps as Record<string, Record<string, unknown>> | undefined,
    packages: raw.packages as Array<string | { source: string; extensions?: string[]; skills?: string[]; prompts?: string[]; themes?: string[] }> | undefined,
  };
}
```

### Step 2: Rewrite `writeNexusUserConfig()` to merge into `settings.json`

**File:** `packages/nexus-runtime/src/config/writeNexusUserConfig.ts`

```ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getUserSettingsPath } from "./getUserSettingsPath.js";
import type { NexusUserConfig } from "./types.js";

/**
 * Writes Nexus user preferences into the global settings file.
 *
 * Reads the existing `~/.config/nexus/settings.json`, merges the provided
 * Nexus keys (`extensions`, `miniApps`, `packages`), and writes back the
 * full file. Pi-owned keys (theme, packages from Pi) are preserved.
 *
 * @param config User config to persist.
 */
export function writeNexusUserConfig(config: NexusUserConfig): void {
  const settingsPath = getUserSettingsPath();
  const existing = existsSync(settingsPath)
    ? JSON.parse(readFileSync(settingsPath, "utf8")) as Record<string, unknown>
    : {};

  const next: Record<string, unknown> = { ...existing };

  if (config.extensions) {
    next.extensions = config.extensions;
  } else if (next.extensions) {
    delete next.extensions;
  }

  if (config.miniApps) {
    next.miniApps = config.miniApps;
  } else if (next.miniApps) {
    delete next.miniApps;
  }

  if (config.packages) {
    next.packages = config.packages;
  } else if (Array.isArray(next.packages)) {
    // Only remove packages if the caller explicitly passed empty.
    // If config.packages is undefined, leave existing alone.
  }

  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}
```

Wait — this has a subtle problem. `config.packages` in `NexusUserConfig` represents **Nexus package sources** (custom registries), while `settings.json` also contains **Pi's packages**. We need to be careful not to clobber Pi's package list.

Let me refine the approach:

### Step 2 (refined): Write-only Nexus keys

The Nexus keys (`extensions`, `miniApps`) are written as top-level keys in `settings.json`. When writing, we read the existing file, update only Nexus keys, and write back. Pi's keys (theme, Pi packages) are preserved automatically.

```ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getUserSettingsPath } from "./getUserSettingsPath.js";
import type { NexusUserConfig } from "./types.js";

/**
 * Writes Nexus user preferences into the global settings file.
 *
 * Reads the existing `~/.config/nexus/settings.json`, merges the provided
 * Nexus keys (`extensions`, `miniApps`), and writes back the full file.
 * Pi-owned keys (theme, packages) are preserved unchanged.
 *
 * @param config User config to persist.
 */
export function writeNexusUserConfig(config: NexusUserConfig): void {
  const settingsPath = getUserSettingsPath();
  const existing = existsSync(settingsPath)
    ? JSON.parse(readFileSync(settingsPath, "utf8")) as Record<string, unknown>
    : {};

  const next: Record<string, unknown> = { ...existing };

  // Write extensions (Nexus extension enable/disable toggles)
  if (config.extensions && Object.keys(config.extensions).length > 0) {
    next.extensions = config.extensions;
  } else {
    delete next.extensions;
  }

  // Write miniApps (per-mini-app preferences)
  if (config.miniApps && Object.keys(config.miniApps).length > 0) {
    next.miniApps = config.miniApps;
  } else {
    delete next.miniApps;
  }

  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}
```

Note: `NexusUserConfig.packages` is **not** written by `writeNexusUserConfig` — it's managed separately by the `/pi-packages` command which writes directly to Pi's packages list in settings. This avoids the clobbering problem.

### Step 3: Remove `getUserConfigPath()` and update exports

**File:** `packages/nexus-runtime/src/config/getUserConfigPath.ts` — **delete this file.**

Update `packages/nexus-runtime/src/config/index.ts` (if it exists) to remove the export.

### Step 4: Update all callers that reference `config.json`

Search for all test files and source files that write to or read from `~/.config/nexus/config.json` and update them to write to/read from `settings.json` instead.

Files to update:

| File | Change |
|---|---|
| `test/e2e/cli/automationsCommand.test.ts` | Write `settings.json` instead of `config.json` |
| `test/e2e/cli/createHelpCommandEnv.ts` | Write `settings.json` instead of `config.json` |
| `test/e2e/web-search/loadWebToolsConfigRegression.test.ts` | Write `settings.json` instead of `config.json` |
| `test/feature-flags/featureFlags.test.ts` | Write `settings.json` instead of `config.json` |
| `test/extensions/pi-packages/showPiPackagesModal.test.ts` | Write `settings.json` instead of `config.json` |
| `test/e2e/tetris/tetrisMusicPreference.test.ts` | Read from `settings.json` |
| `test/e2e/tetris/tetrisSettings.test.ts` | Read from `settings.json` |
| `docs/web-tools-extension-design.md` | Update references from `config.json` to `settings.json` |
| `docs/plan/2026-07-14-pi-packages-third-party-disable.md` | Update references |

### Step 5: Handle `readNexusMemorySettings()`

**File:** `packages/mini-apps/src/memory/settings/readNexusMemorySettings.ts`

This function reads `settings.json` directly (not via `readNexusUserConfig`). Since it reads the same file now, it continues to work. However, it reads the raw file and extracts `memory.root`. This should be folded into the unified `readNexusUserConfig()` approach, or kept as-is since it already reads `settings.json`.

Decision: Keep `readNexusMemorySettings` as-is. It reads `settings.json` directly and extracts a sub-key. This is fine — it's a mini-app that has its own settings convention.

### Step 6: Update `applyNexusConfigPatch()` — remove the sync workaround

**File:** `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts`

The third-party-disable plan added a `filterDisabledPackages` step that syncs Nexus extension state into Pi's packages list. Since `readNexusUserConfig()` now reads from `settings.json` (the same file), the sync workaround can be simplified:

The `filterDisabledPackages` function reads `readNexusUserConfig()` which now reads from `settings.json`. It filters Pi's packages based on Nexus extension preferences — all within the same file. No cross-file sync is needed.

### Step 7: Migration — handle existing user config

For users who already have `~/.config/nexus/config.json`:

1. On first boot after this change, `readNexusUserConfig()` will read `settings.json` (which may be empty or contain only Pi settings).
2. The user's existing config in `config.json` is lost unless we migrate it.

**Migration step:** On first boot, check if `config.json` exists. If so, read its `extensions` and `miniApps` keys and merge them into `settings.json`, then delete `config.json`.

Add to `applyNexusConfigPatch()`:

```ts
/**
 * Migrates legacy config.json into settings.json on first boot.
 * Only runs once: reads Nexus keys from config.json, merges them
 * into settings.json, and deletes config.json.
 */
function migrateLegacyConfig(): void {
  const configPath = getUserConfigPath(); // if still exported temporarily
  const settingsPath = getUserSettingsPath();

  if (!existsSync(configPath)) return;

  try {
    const legacy = JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>;
    const existing = existsSync(settingsPath)
      ? JSON.parse(readFileSync(settingsPath, "utf8")) as Record<string, unknown>
      : {};

    const next: Record<string, unknown> = { ...existing };

    if (legacy.extensions) next.extensions = legacy.extensions;
    if (legacy.miniApps) next.miniApps = legacy.miniApps;
    if (legacy.packages) next.packages = legacy.packages;

    mkdirSync(dirname(settingsPath), { recursive: true });
    writeFileSync(settingsPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    unlinkSync(configPath);
  } catch {
    // If migration fails, silently skip — user can manually migrate.
  }
}
```

Call `migrateLegacyConfig()` early in `applyNexusConfigPatch()`.

## Files to modify

| File | Action |
|---|---|
| `packages/nexus-runtime/src/config/readNexusUserConfig.ts` | **Rewrite** — read from `settings.json`, extract Nexus keys |
| `packages/nexus-runtime/src/config/writeNexusUserConfig.ts` | **Rewrite** — merge Nexus keys into `settings.json` |
| `packages/nexus-runtime/src/config/getUserConfigPath.ts` | **Delete** |
| `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts` | Add `migrateLegacyConfig()` call; update sync workaround to use unified reader |
| `packages/nexus-runtime/src/config/index.ts` | Remove `getUserConfigPath` export |
| `test/e2e/cli/automationsCommand.test.ts` | Write `settings.json` |
| `test/e2e/cli/createHelpCommandEnv.ts` | Write `settings.json` |
| `test/e2e/web-search/loadWebToolsConfigRegression.test.ts` | Write `settings.json` |
| `test/feature-flags/featureFlags.test.ts` | Write `settings.json` |
| `test/extensions/pi-packages/showPiPackagesModal.test.ts` | Write `settings.json` |
| `test/e2e/tetris/tetrisMusicPreference.test.ts` | Read from `settings.json` |
| `test/e2e/tetris/tetrisSettings.test.ts` | Read from `settings.json` |
| `docs/web-tools-extension-design.md` | Update references |
| `docs/plan/2026-07-14-pi-packages-third-party-disable.md` | Update references |

## Risk assessment

- **Migration failure:** If `migrateLegacyConfig()` fails (corrupt `config.json`), the user loses their Nexus config but Pi settings remain intact. This is acceptable — the user can re-configure extensions.
- **Pi clobbering:** If `writeNexusUserConfig()` accidentally overwrites Pi keys (theme, Pi packages), Pi settings are lost. The refined write approach only touches `extensions` and `miniApps` keys, preserving all others.
- **Dual readers:** `neo-editor refreshTransportPreference`, `slash-menu readGlobalSettings`, and `readNexusMemorySettings` all read `settings.json` directly. They continue to work because the file still exists at the same path.
- **Existing users with both files:** The migration handles the common case. Users with manually edited `config.json` will have their Nexus keys merged into `settings.json` on first boot.

## Testing

- E2E test: Existing `config.json` is migrated to `settings.json` on first boot after upgrade.
- E2E test: Writing extension toggle via `/pi-packages` updates `settings.json` correctly.
- E2E test: Tetris music preference reads from unified `settings.json`.
- E2E test: Automations dbPath reads from unified `settings.json`.
- E2E test: `config.json` no longer exists after migration.
- E2E test: PI packages from Pi settings are preserved after Nexus writes extension toggles.
