# Audit: hotkeys

## Summary

The hotkeys extension contains **one** redundant feature-flag enable check. The check
guards the `registerHotkeysCommandHook` registration callback, preventing the hotkeys
UI from rendering when `hotkeys` is disabled. However, the feature-flags system already
gates loading of the entire extension — if `hotkeys` is disabled in `config.json`,
`registerEnabledExtensions` will never call `registerHotkeysExtension`, so this internal
check is dead code.

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/registerHotkeysCommandHook.ts` | `isRuntimeExtensionFeatureEnabled("hotkeys")` on line 13, inside the `setHotkeysCommandHook` callback | `@nexus/feature-flags` | **own-enablement-check** | Remove the `isRuntimeExtensionFeatureEnabled` check and its import. The extension won't load if disabled, so this branch is unreachable. |

### Detail

**File:** `src/registerHotkeysCommandHook.ts`
**Line:** 13
**Code:**
```ts
if (!isRuntimeExtensionFeatureEnabled("hotkeys")) {
    setHotkeysCommandHook(undefined);
    return;
}
```

This check sits inside the callback registered by `setHotkeysCommandHook`. It asks:
"is the hotkeys extension enabled?" — but the answer is already encoded in whether
`registerHotkeysExtension` was called at all.

The flow is:

1. `registerEnabledExtensions(flags)` reads the active feature-flag state and calls
   `setRuntimeExtensionFeatureFlags(flags)`.
2. For each enabled extension, it calls the corresponding `register*Extension` function
   from `createExtensionRegisterMap()`.
3. `registerHotkeysExtension` calls `registerHotkeysCommandHook`, which calls
   `setHotkeysCommandHook(...)` with a callback.
4. Inside that callback, `isRuntimeExtensionFeatureEnabled("hotkeys")` is called.

Steps 1–3 only execute when the extension is enabled (step 1 filters to enabled flags).
Step 4's check is therefore always `true` when reached — it is unreachable dead code.

**Note on `clearHotkeysCommandHook`:** The sibling function `clearHotkeysCommandHook`
also imports `setHotkeysCommandHook` from `@nexus/pi-platform`, but this is a platform
API (not a feature-flag check), so it is correctly used.

## Wiring Plan

No injection points are needed for this fix. The change is a simple removal:

### `src/registerHotkeysCommandHook.ts`

**Before:**
```ts
import { isRuntimeExtensionFeatureEnabled } from "@nexus/feature-flags";
import { setHotkeysCommandHook } from "@nexus/pi-platform";
// ...

export function registerHotkeysCommandHook(): void {
    setHotkeysCommandHook((mode) => {
        if (!isRuntimeExtensionFeatureEnabled("hotkeys")) {
            setHotkeysCommandHook(undefined);
            return;
        }
        // ... rest of callback
    });
}
```

**After:**
```ts
import { setHotkeysCommandHook } from "@nexus/pi-platform";
// ...

export function registerHotkeysCommandHook(): void {
    setHotkeysCommandHook((mode) => {
        // No enablement check needed — the extension won't load if disabled.
        // ... rest of callback unchanged
    });
}
```

### `src/registerHotkeysExtension.ts`

No changes needed. This file already delegates directly to
`registerHotkeysCommandHook()` without any feature-flag guard.

### `createExtensionRegisterMap()` (feature-flags package)

No changes needed. This file already maps `"hotkeys"` → `registerHotkeysExtension`
and the gating happens at the `registerEnabledExtensions` level.

### `@nexus/feature-flags` exports

No changes needed. `isRuntimeExtensionFeatureEnabled` is legitimately used by the
`feature-management` extension (which shows/edits feature flags in the UI) and by
other extensions that need to query sibling extension states. Removing it from hotkeys
does not affect its availability.
