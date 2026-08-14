# Audit: auto-update

## Scope

All source files in `packages/extension-core/auto-update/src/` (13 files, 15 TypeScript source files).

## Imports Summary

| Import source | Type | Files |
|---------------|------|-------|
| `@earendil-works/pi-coding-agent` | Runtime + type | `registerAutoUpdateExtension.ts`, `checkForNexusUpdate.ts`, `installNexusUpdate.ts`, `showAutoUpdateModal.ts` |
| `@earendil-works/pi-tui` | Runtime | `AutoUpdateModal.ts` |
| `@nexus/tui-kit` | Runtime + type | `AutoUpdateModal.ts`, `showAutoUpdateModal.ts`, `createAutoUpdateModalLines.ts` |
| Internal modules (within auto-update) | Runtime | All files reference other files within the same extension |
| `@nexus/feature-flags` | **None** | — |

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| *(none)* | — | — | — | — |

**No redundant feature-flag checks or sibling-extension imports were found.**

The auto-update extension:

- Does **not** import or call `isRuntimeExtensionFeatureEnabled()`, `getEnabledExtensionFeatureFlags()`, `getRegisteredToolRecords()`, `getAllBundledExtensionIds()`, or any other symbol from `@nexus/feature-flags`.
- Does **not** statically import any sibling extension's runtime class or function.
- Does **not** check its own enablement status before executing code (there is no `if` guard based on feature flags).
- Does **not** import `@nexus/feature-flags` in its `package.json` dependencies.
- All imports are either internal (within the same extension) or to external packages (`@earendil-works/pi-coding-agent`, `@earendil-works/pi-tui`, `@nexus/tui-kit`) that are not sibling extensions.

## Wiring Plan

No wiring changes needed. The `registerAutoUpdateExtension()` registration in `registerBundledExtensions()` is already clean — it takes only the `ExtensionAPI` and performs its work through the `pi` event system without requiring injection of sibling extension references.

## Conclusion

**The auto-update extension is clean.** It has no redundant feature-flag enable checks, no sibling-extension cross-imports, and no unnecessary compile-time coupling to other extensions. No changes are required.
