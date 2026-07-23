# Feature Flags Rewrite — Hardcoded Registry with User Overrides

**Date:** 2026-07-23
**Status:** Implemented

---

## Problem

Feature flags currently read from a JSON file (`feature-flags.json`) at the repo root, with a fallback chain: source-mode JSON → bundled release JSON → compiled TypeScript. This creates:

1. A missing source file (git history has it, working tree does not)
2. Build-time compilation scripts that depend on that missing file
3. Source-mode resolution that falls back to package-dir resolution
4. Duplicate registration paths (`registerBundledExtensions` vs `registerCompiledEnabledExtensions`)
5. Dead code: JSON reading, JSON writing, source-mode path resolution

## Goal

Eliminate all JSON files and JSON-reading from the feature-flag system. The app ships with all extensions enabled by default, baked into a hardcoded TypeScript file. Users disable extensions via their `config.json`.

---

## Current State (What Exists Today)

### The JSON File System

- `feature-flags.json` at repo root — contains all extension IDs, their `enabled` status, `features` descriptions, and `category`
- Build scripts (`scripts/feature-flags/*.mjs`) compile this JSON into:
  - `packages/feature-flags/src/generated/compiledFeatureFlags.ts` — hardcoded TS constant
  - `packages/extension-core/src/generated/registerCompiledEnabledExtensions.ts` — hardcoded registration map
  - `.release/*/runtime/feature-flags/compiled-feature-flags.json` — release manifest

### The Runtime System

- `runtimeExtensionFeatureState.ts` — a global `Map<string, boolean>` storing enabled/disabled state after startup
- `applySystemExtensionAvailability.ts` — checks if `cmux` command exists on the system; disables the cmux extension if not
- `createExtensionFeatureFlags.ts` — reads JSON config → merges user overrides → applies system checks → maps IDs to registration functions
- `createExtensionRegisterMap.ts` — hardcoded mapping of 22 extension IDs to their registration functions
- `registerEnabledExtensions.ts` — iterates flags, writes runtime state, calls `register()` on each enabled extension

### The Two Registration Paths

1. **`registerBundledExtensions`** (source mode) — calls `createExtensionFeatureFlags()` then `registerEnabledExtensions()`
2. **`registerCompiledEnabledExtensions`** (generated, release mode) — directly imports registration functions, reads from bundled config, checks flags manually

Both paths exist. They do essentially the same thing but with different code paths.

### Runtime Consumers

Five runtime callers check `isRuntimeExtensionFeatureEnabled()` after startup:
- `PromptlineEditor.ts` — checks "hotkeys" to decide whether to show the hotkey trigger
- `refreshTriggerModal.ts` — checks "slash-menu" to decide whether to close the trigger modal
- `registerHotkeysCommandHook.ts` — checks "hotkeys" to decide whether to install the hotkey hook
- Two startup hero counters — count enabled extensions/mini-apps

---

## Target State (What Will Exist After)

### The Hardcoded Registry

- `compiledFeatureFlags.ts` contains ALL extensions and mini-apps, all with `enabled: true`
- This file is the single source of truth — no JSON files, no JSON reading, no build-time compilation
- Every extension in the codebase has an entry here with its feature descriptions

### The User Override Layer

- Users edit `~/.config/nexus/config.json` and set `featureFlags.<extensionId>.enabled = false` for any extension they want to disable
- The config can only DISABLE — it cannot enable extensions that aren't in the hardcoded registry
- `features` and `category` fields are immutable (read from the hardcoded registry only)

### The Startup Flow

1. Read `compiledFeatureFlags.ts` — the hardcoded defaults (all enabled)
2. Read `~/.config/nexus/config.json` — user overrides (disabled extensions)
3. Apply system checks (currently: `cmux` command availability)
4. Build a list of `{id, enabled, features, register}` for each extension
5. For each enabled extension, call its `register(pi)` function
6. Write the final enabled/disabled state into the in-memory Map
7. Later runtime code reads from the in-memory Map to decide whether to install hooks/show UI

### What Gets Removed

- `feature-flags.json` at repo root (entire file, all references)
- `scripts/feature-flags/*.mjs` — all build-time compilation scripts
- `packages/feature-flags/src/getFeatureFlagsConfigPath.ts` — source-mode JSON path resolution
- `packages/feature-flags/src/readFeatureFlagsConfig.ts` — JSON file reader
- `packages/feature-flags/src/readJsonFeatureFlagsConfig.ts` — JSON file reader
- `packages/feature-flags/src/writeFeatureFlagsConfig.ts` — JSON file writer
- `packages/feature-flags/src/getBundledFeatureFlagsConfig.ts` — reads from compiled TS (replaced by direct import)
- `packages/feature-flags/src/generated/compiledFeatureFlags.ts` — build artifact (replaced by the hardcoded registry)
- `packages/extension-core/src/generated/registerCompiledEnabledExtensions.ts` — generated registration (replaced by unified path)
- `scripts/release/binary/writeReleaseFeatureFlagsManifest.mjs` — release manifest writer
- `scripts/release/binary/copyTetrisMusicAsset.mjs` — release asset copier (reads JSON)
- `apps/tui/src/cli/features/readCliFeatureFlagsConfig.ts` — CLI feature gating
- `apps/tui/src/cli/features/isCliFeatureAvailable.ts` — CLI feature gating
- `apps/tui/src/cli/features/types.ts` — CLI feature types
- `packages/extension-core/src/startup-hero/readAvailableStartupHeroFeatureFlagsConfig.ts` — startup hero reads JSON
- `packages/extension-core/src/startup-hero/countEnabledStartupHeroMiniApps.ts` — counts from JSON
- `packages/extension-core/src/startup-hero/countEnabledStartupHeroExtensions.ts` — counts from JSON
- `packages/extension-core/src/runtime/registerCompiledBundledExtensions.ts` — redundant registration path

### What Stays (Simplified)

- `runtimeExtensionFeatureState.ts` — in-memory Map for runtime checks (stays, but populated from hardcoded registry)
- `applySystemExtensionAvailability.ts` — system-level checks (stays, cmux check only)
- `createExtensionRegisterMap.ts` — hardcoded ID-to-function mapping (stays, updated to match new registry)
- `registerEnabledExtensions.ts` — the registration dispatcher (stays, simplified)
- `createExtensionFeatureFlags.ts` — the factory (stays, simplified to read from hardcoded TS instead of JSON)
- `types.ts` — type definitions (stays, may be simplified)
- `tool-registry/` — tool registration records (stays, unrelated to feature flags)
- `createExtensionFeatureFlagReport.ts` — debug report (stays, for CLI output)
- `isRuntimeFeatureAvailable.ts` — dev-only gating (stays, for CLI exposure)
- `isPromiseLike.ts` — internal helper (stays, inlineable)
- `getEnabledExtensionFeatureFlags.ts` — internal filter (stays, inlineable)
- `createExtensionRegistrationTask.ts` — internal helper (stays, inlineable)

---

## Implementation Steps

### Step 1: Audit the Hardcoded Registry

- List every extension registration function currently in `createExtensionRegisterMap.ts`
- Compare against `compiledFeatureFlags.ts` to identify any extensions in the registry but missing from the compiled flags (or vice versa)
- Identify the canonical list of all extensions and mini-apps that should be in the hardcoded registry

### Step 2: Create the New Hardcoded Registry

- Create `packages/feature-flags/src/registry.ts` (or similar) containing the complete list of all extensions
- Each entry: `{id, features: string[], category: FeatureProductCategory}`
- All extensions default to `enabled: true`
- This file is the single source of truth

### Step 3: Simplify the Runtime State

- `runtimeExtensionFeatureState.ts` stays as-is — it's a simple Map, no changes needed
- Remove `setRuntimeExtensionFeatureFlags()` and `setRuntimeExtensionFeatureState()` if callers can be updated to write directly

### Step 4: Simplify the Startup Flow

- `createExtensionFeatureFlags()` reads from the hardcoded registry instead of JSON
- Applies user overrides from `config.json` (disable-only)
- Applies system checks (cmux availability)
- Returns the flag list for registration
- Remove `readFeatureFlagsConfig()`, `readJsonFeatureFlagsConfig()`, `getFeatureFlagsConfigPath()`, `getBundledFeatureFlagsConfig()`

### Step 5: Unify Registration Paths

- Remove `registerCompiledEnabledExtensions.ts` (the generated path)
- Remove `registerCompiledBundledExtensions.ts` (the consumer of the generated path)
- Keep only `registerBundledExtensions` as the single registration entrypoint
- Update `registerBundledExtensions` to use the new simplified flow

### Step 6: Remove Dead Code and References

- Remove all JSON-reading functions from `packages/feature-flags/src/`
- Remove all build-time compilation scripts from `scripts/feature-flags/`
- Remove all release-time scripts that read `feature-flags.json` from `scripts/release/`
- Remove CLI feature-gating code from `apps/tui/src/cli/features/`
- Remove startup-hero code that reads from JSON from `packages/extension-core/src/startup-hero/`
- Update `AGENTS.md` to remove the reference to `feature-flags.json` as the extension inventory
- Update any remaining comments that reference `feature-flags.json`

### Step 7: Update User Config Schema

- Document in `~/.config/nexus/config.json` schema that `featureFlags` entries can only set `enabled: false` and `devOnly: true`
- No new fields can be added by users (features, category are read-only)

### Step 8: Testing

- Verify all 22+ extensions still register correctly when enabled by default
- Verify disabling an extension via config.json prevents its registration
- Verify runtime checks (`isRuntimeExtensionFeatureEnabled`) return correct values after disabling
- Verify startup hero UI shows correct counts when extensions are disabled
- Verify CLI feature gating is removed (no more feature-flags.json dependency in CLI)
- Verify release build (bun bundle) works without the JSON file

---

## Risks

- **Notify extension special case:** The notify extension reads `userConfig.notifyEnabled` inside its registration function rather than using the global map. This is inconsistent with the rest of the system and should be unified into the standard flow.
- **Two registration paths:** Both `registerBundledExtensions` and `registerCompiledEnabledExtensions` exist. If both are called during startup, extensions could be registered twice. Need to verify only one is used.
- **CLI feature gating:** The CLI currently reads from JSON for feature gating. Removing this means CLI commands that depend on feature flags will need a new mechanism (or simply be removed if they're not needed in release mode).
- **Startup hero counts:** The startup hero counts enabled extensions and mini-apps. If it reads from JSON, removing JSON means the counts will need to read from the hardcoded registry instead.

---

## Files to Create

- `packages/feature-flags/src/registry.ts` — the hardcoded registry (all extensions, all enabled)
- `packages/feature-flags/src/registry.test.ts` — tests for the registry

## Files to Delete

- `feature-flags.json` (repo root)
- `packages/feature-flags/src/getFeatureFlagsConfigPath.ts`
- `packages/feature-flags/src/readFeatureFlagsConfig.ts`
- `packages/feature-flags/src/readJsonFeatureFlagsConfig.ts`
- `packages/feature-flags/src/writeFeatureFlagsConfig.ts`
- `packages/feature-flags/src/getBundledFeatureFlagsConfig.ts`
- `packages/feature-flags/src/generated/compiledFeatureFlags.ts`
- `packages/feature-flags/src/generated/` (entire directory)
- `packages/extension-core/src/generated/registerCompiledEnabledExtensions.ts`
- `packages/extension-core/src/generated/` (entire directory)
- `scripts/feature-flags/` (entire directory)
- `scripts/release/binary/writeReleaseFeatureFlagsManifest.mjs`
- `scripts/release/binary/copyTetrisMusicAsset.mjs`
- `scripts/release/binary/isCompiledFeatureEnabled.mjs`
- `apps/tui/src/cli/features/` (entire directory)
- `packages/extension-core/src/startup-hero/readAvailableStartupHeroFeatureFlagsConfig.ts`
- `packages/extension-core/src/startup-hero/countEnabledStartupHeroMiniApps.ts`
- `packages/extension-core/src/startup-hero/countEnabledStartupHeroExtensions.ts`
- `packages/extension-core/src/runtime/registerCompiledBundledExtensions.ts`
- `packages/extension-core/src/runtime/createCompiledBundledExtensionFactories.ts`

## Files to Modify

- `packages/feature-flags/src/index.ts` — update exports
- `packages/feature-flags/src/createExtensionFeatureFlags.ts` — read from hardcoded registry instead of JSON
- `packages/feature-flags/src/mergeUserFeatureFlagOverrides.ts` — update comments, may simplify
- `packages/feature-flags/src/registerEnabledExtensions.ts` — simplify, remove JSON dependencies
- `packages/feature-flags/src/createExtensionRegisterMap.ts` — update to match new registry
- `packages/feature-flags/src/types.ts` — may simplify
- `packages/feature-flags/package.json` — update dependencies if any become unused
- `packages/extension-core/src/runtime/registerBundledExtensions.ts` — use unified registration path
- `AGENTS.md` — remove references to `feature-flags.json` as extension inventory
- `docs/plans/` — this file
