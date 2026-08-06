# Plan: Fix Pi Packages Runtime Loading

## Problem

Disabling a third-party package via `/pi-packages` has no effect at runtime. Furthermore, **enabled packages never load either** — all third-party Pi packages are silently ignored.

### Root Cause

The `applyNexusConfigPatch()` function (in `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts`) wraps `SettingsManager.fromStorage()` to convert Nexus-style `extensions.pi_packages` into Pi-expected `globalSettings.packages`. However, the conversion reads `extensions.pi_packages` from `manager.globalSettings.extensions`:

```ts
// BEFORE (buggy):
const nexusExt = (manager.globalSettings as Record<string, unknown>).extensions;
```

But `manager.globalSettings` comes from the **stub storage** passed to `fromStorage()`. The stub's `withLock()` method returns `undefined`, so `globalSettings` has no `extensions` field. This means `nexusExt` is always `undefined`, the `if` check fails, `convertedPackages` stays `undefined`, and Pi never sees any packages.

### Why This Was Never Fixed

A plan document exists at `docs/plan/2026-07-14-pi-packages-third-party-disable.md` that describes the intended design. However, **the implementation was never completed**:

- No `syncNexusUserExtensionsToPiSettings.ts` file was created
- No e2e tests (`checkChromeCommand.test.ts`, `checkChromeCommandDisabled.test.ts`, `thirdPartyDisable.test.ts`) were created
- The bug in `applyNexusConfigPatch.ts` was never identified

## Solution

Read `extensions.pi_packages` from Nexus user config directly via `readNexusUserConfig()` instead of from the stubbed `manager.globalSettings`.

### Implementation

**File:** `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts`

**Changes:**

1. Add import for `readNexusUserConfig`:
```ts
import { readNexusUserConfig } from "./readNexusUserConfig.js";
```

2. In the patched `fromStorage()`, replace the buggy read from `manager.globalSettings` with a direct read from Nexus user config:

```ts
// BEFORE (buggy):
const nexusExt = (manager.globalSettings as Record<string, unknown>).extensions;

// AFTER (fixed):
const nexusUserConfig = readNexusUserConfig();
const nexusExt = nexusUserConfig.extensions;
```

3. Add a comment explaining why this read path is critical (the stub storage provides no data).

### How It Works

The runtime flow after the fix:

1. Nexus calls `applyNexusConfigPatch()` at startup (in `runApp.ts`)
2. This wraps `SettingsManager.fromStorage()` with the Nexus conversion logic
3. When Pi calls `SettingsManager.create()`, it calls the patched `fromStorage()`
4. Patched `fromStorage()` calls the real `fromStorage()` with stub storage → returns manager with empty `globalSettings`
5. **NEW:** We read `extensions.pi_packages` directly from `~/.config/nexus/settings.json` via `readNexusUserConfig()`
6. For each source where `enabled` is truthy, the source string is added to the `packages` array
7. Patched `getGlobalSettings()` returns `globalSettings` with the converted `packages` array
8. Pi's `PackageManager.resolve()` sees the packages and loads them

### Files Modified

| File | Change |
|---|---|
| `packages/nexus-runtime/src/config/applyNexusConfigPatch.ts` | Read `extensions.pi_packages` from `readNexusUserConfig()` instead of stubbed `manager.globalSettings` |

### Files Not Yet Created (Future Work)

These were planned but never implemented:

| File | Status |
|---|---|
| `packages/nexus-runtime/src/config/syncNexusUserExtensionsToPiSettings.ts` | Never created — not needed with current fix |
| `test/e2e/pi-packages/thirdPartyDisable.test.ts` | Never created |
| `test/e2e/pi-packages/checkChromeCommand.test.ts` | Never created — enabled baseline test |
| `test/e2e/pi-packages/checkChromeCommandDisabled.test.ts` | Never created — disabled verification test |

### Risk Assessment

- **Low risk:** The change is a single-variable substitution (reading from `readNexusUserConfig()` instead of `manager.globalSettings.extensions`). The rest of the conversion logic (filtering disabled packages, building the merged array) remains unchanged.
- **No behavioral change for users with no Nexus config:** If `~/.config/nexus/settings.json` doesn't exist or has no `extensions` field, `nexusExt` is `undefined` and the behavior is identical to before (no packages loaded, which was the bug).
- **No behavioral change for bundled extensions:** Bundled extensions go through Nexus's `registerEnabledExtensions()` path, not through Pi's `PackageManager.resolve()` path. This fix only affects third-party Pi packages.

## Verification

1. TypeScript compiles cleanly: `npx tsc --project packages/nexus-runtime/tsconfig.json --noEmit`
2. Restart Nexus — third-party Pi packages listed in `extensions.pi_packages` with `true` (or omitted) should now be loaded by Pi's `PackageManager.resolve()`
3. Disabling a package via `/pi-packages` (setting it to `false`) should prevent it from loading on restart
