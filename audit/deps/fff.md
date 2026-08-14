# Audit: fff

## Summary

The `fff` (Fuzzy File Finder) extension contains **zero redundant feature-flag enable checks**.

The extension does not import from `@nexus/feature-flags`, does not call `isRuntimeExtensionFeatureEnabled()`, `getEnabledExtensionFeatureFlags()`, `getRegisteredToolRecords()`, `getAllBundledExtensionIds()`, or any other feature-flags API. It also has **no cross-extension imports** — no static imports of sibling extension runtime classes or functions.

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| *(none)* | — | — | — | — |

**No findings.** The `fff` extension is clean.

## Detailed Analysis

### What `fff` does import

The `fff` extension imports only from:

1. **`@earendil-works/pi-coding-agent`** — the Pi extension API (e.g., `ExtensionAPI`, `ExtensionContext`, `createReadTool`, `createGrepTool`). This is the platform SDK, not a sibling extension.
2. **`@nexus/runtime`** — a single import of `resolveInstalledDependencyPath` in `runtime/getFffNodeEntryPath.ts`. This is the runtime core, not the feature-flags package.
3. **`node:*`** — standard library modules (`node:fs/promises`, `node:path`, `node:crypto`, `node:os`).

### Internal feature state (not feature-flags)

The `fff` extension has its own internal feature state system managed through:

- `src/features/definitions.ts` — defines three FFF sub-features: `editorAutocomplete`, `readOverride`, `grepOverride`
- `src/features/loadFeatureState.ts` — reads a local JSON config file (`enabledFeatures` array)
- `src/features/saveFeatureState.ts` — persists feature state to disk

This internal system is **not** the `@nexus/feature-flags` package. It is FFF's own user-facing toggle system for enabling/disabling sub-features within FFF (e.g., whether to override the grep tool, whether to provide autocomplete). The `loadFeatureState()` calls in `registerGrepOverride.ts`, `registerReadOverride.ts`, and `wrapAutocompleteProviderForCwd.ts` query this local state, not the system-level feature-flags system.

This is a **legitimate** internal gating mechanism — it allows users to selectively disable FFF sub-features (grep override, read override, autocomplete) without disabling the entire extension. This pattern is appropriate and not redundant.

### Cross-extension imports

**None.** The `fff` extension has zero imports from other extensions in `packages/extension-core/`. It does not reference sibling extensions at all.

### Feature-flags package references

**None.** The `fff` extension does not import from `@nexus/feature-flags` and does not call any of the following APIs:

- `isRuntimeExtensionFeatureEnabled()`
- `getEnabledExtensionFeatureFlags()`
- `getRegisteredToolRecords()`
- `getAllBundledExtensionIds()`
- `isExtensionEnabled()`

## Wiring Plan

Not applicable — no injection points needed. The `fff` extension has no redundant checks to replace with injection.

## Conclusion

The `fff` extension is clean. It does not gate on `@nexus/feature-flags` enablement, does not import sibling extension runtime code, and its internal `loadFeatureState()` calls are for its own user-configurable sub-features, not the system-level feature-flags system. No changes are required.
