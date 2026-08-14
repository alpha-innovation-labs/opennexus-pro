# Audit: startup-hero

## Summary

The startup-hero extension imports two functions from `@nexus/feature-flags` in two source files:
`countEnabledStartupHeroExtensions.ts` and `countEnabledStartupHeroMiniApps.ts`. Both functions
query the runtime enablement state of *other* extensions (siblings) to produce the status
line shown in the startup hero banner.

These checks are **redundant** with respect to the feature-flags loading gate. When
`registerBundledExtensions()` calls `registerEnabledExtensions()`, only enabled extensions
are registered. If an extension is disabled, its registration function never runs, so
`isRuntimeExtensionFeatureEnabled()` will never see it — the startup-hero extension itself
is the one being *counted*, not the one being *gated*.

The core issue: startup-hero iterates over **all** bundled extension IDs and calls
`isRuntimeExtensionFeatureEnabled()` on each one. This is a sibling-enabling check that
duplicates the work already done by `registerEnabledExtensions()` (which filters the
registry to `enabled: true` entries before calling `createExtensionRegistrationTask()`).

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/countEnabledStartupHeroExtensions.ts` | `getAllBundledExtensionIds()` | `@nexus/feature-flags` (registry.ts) | **sibling-import** | Replace with an injected list of extension IDs from `registerBundledExtensions()`. The count should be computed from the list of *registered* extensions, not by re-scanning the full registry. |
| `src/countEnabledStartupHeroExtensions.ts` | `isRuntimeExtensionFeatureEnabled(id)` (for each sibling extension ID) | `@nexus/feature-flags` (runtimeExtensionFeatureState.ts) | **own-enablement-check** (on siblings) | Remove the per-sibling `isRuntimeExtensionFeatureEnabled()` call. Instead, accept an injected count of enabled extensions from the feature-flags system. |
| `src/countEnabledStartupHeroMiniApps.ts` | `isRuntimeExtensionFeatureEnabled(id)` (for "tetris") | `@nexus/feature-flags` (runtimeExtensionFeatureState.ts) | **own-enablement-check** (on sibling) | Remove the per-sibling `isRuntimeExtensionFeatureEnabled()` call. Accept an injected count of enabled mini-apps from the feature-flags system. |

### Detailed breakdown

#### countEnabledStartupHeroExtensions.ts

```typescript
import { getAllBundledExtensionIds } from "@nexus/feature-flags";
import { isRuntimeExtensionFeatureEnabled } from "@nexus/feature-flags";

export function countEnabledStartupHeroExtensions(): number {
  const allIds = getAllBundledExtensionIds();  // ← sibling-import: fetches ALL extension IDs
  const knownMiniApps = new Set(["tetris"]);
  let count = 0;
  for (const id of allIds) {
    if (knownMiniApps.has(id)) continue;
    if (isRuntimeExtensionFeatureEnabled(id)) {  // ← own-enablement-check: re-checks each sibling's enablement
      count++;
    }
  }
  return count;
}
```

**Problem:** This function iterates every extension in the registry and manually checks
whether each one is enabled. But the feature-flags system already does exactly this
in `registerEnabledExtensions()` → `getEnabledExtensionFeatureFlags()` (filters to
`flag.enabled`) and `setRuntimeExtensionFeatureFlags()` (stores the result in
`runtimeExtensionFeatureState`). The startup-hero extension is essentially re-running
the gate logic.

Additionally, `getAllBundledExtensionIds()` is a **static import of a sibling extension's
registry** — it creates a compile-time cross-extension dependency on the full registry,
not just the feature-flags API.

#### countEnabledStartupHeroMiniApps.ts

```typescript
import { isRuntimeExtensionFeatureEnabled } from "@nexus/feature-flags"

export function countEnabledStartupHeroMiniApps(): number {
  const knownMiniApps = ["tetris"];
  let count = 0;
  for (const id of knownMiniApps) {
    if (isRuntimeExtensionFeatureEnabled(id)) {  // ← own-enablement-check: checks sibling "tetris"
      count++;
    }
  }
  return count;
}
```

**Problem:** Same pattern — manually checking whether a sibling (tetris, a mini-app)
is enabled. This duplicates the gating already done by `registerEnabledExtensions()`.

#### Call chain (for context)

```
registerStartupHeroExtension()
  → showStartupHero()
    → getStartupHeroStatus(systemPrompt)
      → countEnabledStartupHeroExtensions()  ← imports @nexus/feature-flags
      → countEnabledStartupHeroMiniApps()    ← imports @nexus/feature-flags
```

Neither `countEnabledStartupHeroExtensions` nor `countEnabledStartupHeroMiniApps` is
called from outside the startup-hero extension (verified: no external callers). They
are internal to the startup-hero extension, exported from `index.ts` only for re-export
within the extension.

## Wiring Plan

To eliminate the redundant feature-flag queries, `registerBundledExtensions()` (or more
precisely, the feature-flags system's `registerEnabledExtensions()`) should pass
pre-computed counts to the startup-hero extension when registering it.

### Option A: Inject counts via registration function signature

Change `registerStartupHeroExtension` to accept an options object:

```typescript
// Before:
export function registerStartupHeroExtension(pi: ExtensionAPI): void { ... }

// After:
export function registerStartupHeroExtension(
  pi: ExtensionAPI,
  opts: { enabledExtensionCount: number; enabledMiniAppCount: number },
): void { ... }
```

Then in `createExtensionRegisterMap.ts`, compute and pass the counts:

```typescript
"startup-hero": (pi) =>
  registerStartupHeroExtension(pi, {
    enabledExtensionCount: /* computed from enabled flags */,
    enabledMiniAppCount:   /* computed from enabled flags */,
  }),
```

The startup-hero extension would then accept these counts as parameters and pass them
into `getStartupHeroStatus()`, eliminating the need for `countEnabledStartupHeroExtensions()`
and `countEnabledStartupHeroMiniApps()` entirely.

### Option B: Inject the list of enabled extension IDs

Instead of counts, inject the list of enabled extension IDs:

```typescript
"startup-hero": (pi) =>
  registerStartupHeroExtension(pi, {
    enabledExtensionIds: /* array of enabled extension IDs */,
    enabledMiniAppIds:   /* array of enabled mini-app IDs */,
  }),
```

The startup-hero extension can then compute whatever display values it needs from these
lists without re-querying `@nexus/feature-flags`.

### Files affected by the fix

| File | Change |
|------|--------|
| `src/countEnabledStartupHeroExtensions.ts` | **Delete** (no longer needed) |
| `src/countEnabledStartupHeroMiniApps.ts` | **Delete** (no longer needed) |
| `src/getStartupHeroStatus.ts` | Accept counts as parameters instead of calling the deleted functions |
| `src/index.ts` | Remove re-exports of the deleted functions |
| `src/registerStartupHeroExtension.ts` | Accept and pass through injected counts |
| `src/showStartupHero.ts` | Accept counts as parameters |
| `src/createStartupHeroWidget.ts` | Accept counts as parameters (already accepts `StartupHeroStatus`) |
| `src/types.ts` | `StartupHeroStatus` interface unchanged (already has `enabledExtensionCount` and `enabledMiniAppCount`) |
| `packages/feature-flags/src/createExtensionRegisterMap.ts` | Pass injected counts when calling `registerStartupHeroExtension` |

### Notes

- The `readAvailableStartupHeroFeatureFlagsConfig.ts` file is an intentional no-op placeholder
  (it states: "The hardcoded registry in @nexus/feature-flags/registry.ts is now the single
  source of truth. Startup hero counts use isRuntimeExtensionFeatureEnabled() directly.")
  This comment is now outdated — once the redundant checks are removed, this file can also
  be deleted.

- No sibling extension runtime classes are statically imported by startup-hero. The only
  external imports are from `@nexus/feature-flags` (the source of the redundancy) and
  `@nexus/runtime` (for resume logic, which is legitimate).

- Type-only imports (`StartupHeroStatus`, `StartupHeroTheme`, `ExtensionContext`) are
  correctly used and pose no cross-extension dependency risk.
