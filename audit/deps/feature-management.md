# Audit: feature-management

## Scope

All source files in `packages/extension-core/feature-management/src/` (22 files).

## Findings

### Cross-Extension Feature-Flag Enablement Checks

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/command/showFeaturesModal.ts` | `isRuntimeExtensionFeatureEnabled(id, userOverrides[id] !== false)` — iterates over **all** bundled extension IDs and checks each one's runtime enablement via `isRuntimeExtensionFeatureEnabled()` | `@nexus/feature-flags` | **legitimate** | No change. This is the feature-management UI extension building its display snapshot. It must read the full runtime state of all extensions to render the modal. |
| `src/command/showFeaturesModal.ts` | `getAllBundledExtensionIds()` — retrieves all registered extension IDs to populate the modal | `@nexus/feature-flags` | **legitimate** | No change. The UI extension needs the full list of extensions to display. |
| `src/command/showFeaturesModal.ts` | `bundledFeatureFlags[id]?.features` — reads the feature-flag registry for each extension's declared features | `@nexus/feature-flags` | **legitimate** | No change. The UI extension needs the registry data to display feature metadata. |
| `src/model/persistFeatureFlagOverride.ts` | `getAllBundledExtensionIds()` — retrieves all registered extension IDs to rebuild rows after a toggle | `@nexus/feature-flags` | **legitimate** | No change. The UI extension needs the full registry to rebuild rows after a flag change. |
| `src/model/persistFeatureFlagOverride.ts` | `bundledFeatureFlags[id]` — reads the feature-flag registry for each extension | `@nexus/feature-flags` | **legitimate** | No change. The UI extension needs the registry data to rebuild rows. |

### Cross-Extension Runtime Imports (Sibling Extension Dependencies)

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/command/showFeaturesModal.ts` | `import { createNexusPackageManager, normalizeNpmPackageName }` from `"@extensions/pi-packages"` | `@extensions/pi-packages` (sibling extension) | **sibling-import** | Replace with injection via `registerBundledExtensions()`. The `registerBundledExtensions()` call for feature-management should pass a `piPackagesManager` factory or the `createNexusPackageManager` function reference. |
| `src/registerFeatureManagementExtensionWithConfig.ts` | `import { withSlashMenuGroup }` from `"@extensions/slash-menu"` | `@extensions/slash-menu` (sibling extension) | **sibling-import** | Replace with injection via `registerBundledExtensions()`. The `registerBundledExtensions()` call for feature-management should pass a `withSlashMenuGroup` utility function reference. |

### Non-Issues (No action needed)

| File | What it checks/imports | From where | Classification |
|------|----------------------|------------|----------------|
| `src/model/persistFeatureFlagOverride.ts` | `import { readNexusUserConfig, writeNexusUserConfig }` from `"@nexus/runtime"` | `@nexus/runtime` (library, not a sibling extension) | **legitimate** — `@nexus/runtime` is not registered in `createExtensionRegisterMap()`; it's a shared library. |
| `src/model/createFeatureStatusRows.ts` | `import type { FeatureFlagConfig, FeatureFlagsConfig, FeatureProductCategory }` from `"@nexus/feature-flags"` | `@nexus/feature-flags` (shared library) | **type-only** — TypeScript type imports are erased at compile time. |
| `src/model/persistFeatureFlagOverride.ts` | `import type { FeatureProductCategory }` from `"@nexus/feature-flags"` | `@nexus/feature-flags` (shared library) | **type-only** — TypeScript type imports are erased at compile time. |
| `src/ui/FeatureManagementModal.ts` | `import type { ExtensionCommandContext }` from `"@earendil-works/pi-coding-agent"` | `@earendil-works/pi-coding-agent` (core package) | **type-only** — TypeScript type import. |
| `src/ui/FeatureManagementModal.ts` | `import { Key, matchesKey }` from `"@earendil-works/pi-tui"` | `@earendil-works/pi-tui` (core library) | **legitimate** — core library, not a sibling extension. |
| `src/ui/FeatureManagementModal.ts` | `import { SelectPreviewModal }` from `"@nexus/tui-kit"` | `@nexus/tui-kit` (library, not a sibling extension) | **legitimate** — `@nexus/tui-kit` is not registered in `createExtensionRegisterMap()`. |
| `src/ui/getFeatureColumnWidth.ts` | `import { visibleWidth }` from `"@earendil-works/pi-tui"` | `@earendil-works/pi-tui` (core library) | **legitimate** — core library. |
| `src/ui/padFeatureColumn.ts` | `import { visibleWidth }` from `"@earendil-works/pi-tui"` | `@earendil-works/pi-tui` (core library) | **legitimate** — core library. |

### Own-Enablement Checks

**None found.** The feature-management extension does **not** call `isRuntimeExtensionFeatureEnabled("feature-management")` to gate its own loading. Its registration functions (`registerFeatureManagementExtension`, `registerCompiledFeatureManagementExtension`, `registerFeatureManagementExtensionWithConfig`) have no internal guard.

## Wiring Plan

Two injection points are needed in the feature-management registration path to replace the static sibling-extension imports:

### 1. `createNexusPackageManager` / `normalizeNpmPackageName` (from `@extensions/pi-packages`)

**Current:** `showFeaturesModal.ts` statically imports `createNexusPackageManager` and `normalizeNpmPackageName` from `@extensions/pi-packages`.

**Proposed injection:** Add a config object parameter to `registerFeatureManagementExtensionWithConfig` (or pass it through `registerBundledExtensions`):

```typescript
// In registerBundledExtensions():
// When registering feature-management, pass:
const config = {
  piPackagesManagerFactory: createNexusPackageManager,
  normalizeNpmPackageName,
};
```

Then update `showFeaturesModal` to accept and use the injected factory instead of importing directly.

### 2. `withSlashMenuGroup` (from `@extensions/slash-menu`)

**Current:** `registerFeatureManagementExtensionWithConfig.ts` statically imports `withSlashMenuGroup` from `@extensions/slash-menu`.

**Proposed injection:** Pass `withSlashMenuGroup` as a config option when feature-management is registered:

```typescript
// In registerBundledExtensions():
// When registering feature-management, pass:
const config = {
  withSlashMenuGroup,
};
```

Then update `registerFeatureManagementExtensionWithConfig` to accept and use the injected utility instead of importing directly.

### Summary of Changes to `registerBundledExtensions()`

The external API signature of `registerBundledExtensions()` must remain unchanged. Instead, the internal wiring within the function should:

1. When registering feature-management, construct a config object containing:
   - `piPackagesManagerFactory: createNexusPackageManager` (the function from `@extensions/pi-packages`)
   - `normalizeNpmPackageName` (the function from `@extensions/pi-packages`)
   - `withSlashMenuGroup` (the function from `@extensions/slash-menu`)

2. Pass this config object to `registerFeatureManagementExtensionWithConfig(pi, config?)`.

3. Inside `registerFeatureManagementExtensionWithConfig`, use the injected functions instead of importing from sibling extension packages.

4. Update `showFeaturesModal` to accept the injected `piPackagesManagerFactory` and `normalizeNpmPackageName` as parameters (or via a config object passed through the registration chain).

No changes to `registerBundledExtensions()`'s **external** signature are needed — only what it passes internally to the feature-management registration functions.
