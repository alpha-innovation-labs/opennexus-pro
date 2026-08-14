# Audit: pi-packages

## Summary

The **pi-packages** extension is a feature-management UI extension that allows users to browse, install, enable, disable, and remove third-party Pi packages (extensions). It is registered in `createExtensionRegisterMap()` under the key `"pi-packages"`.

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| (none) | — | — | — | — |

**No redundant feature-flag checks were found.**

### What was checked

The following patterns were searched across all 27 source files in `packages/extension-core/pi-packages/src/`:

1. **`isRuntimeExtensionFeatureEnabled("pi-packages")`** — Not found anywhere.
2. **`isRuntimeExtensionFeatureEnabled("sibling-extension-name")`** — Not found anywhere.
3. **Imports from `@nexus/feature-flags`** — Not found anywhere. Specifically searched for:
   - `isRuntimeExtensionFeatureEnabled`
   - `getEnabledExtensionFeatureFlags`
   - `getRegisteredToolRecords`
   - `getAllBundledExtensionIds`
   - `registerBundledExtensions`
4. **Sibling extension runtime imports** (e.g., `from "@extensions/..."`) — Not found. All cross-extension imports are from `@earendil-works/...` (pi-coding-agent, pi-tui) or `@nexus/...` (runtime, tui-kit) — all of which are shared packages, not sibling extensions.
5. **Type-only imports from sibling extensions** — None exist. All type imports are from shared packages (`@earendil-works/pi-tui`, `@earendil-works/pi-coding-agent`, `@nexus/runtime`).

### Notes on `enabled`/`enable` references

The extension contains several references to the words "enabled" and "enable" (e.g., `ManagedExtensionStatus = "enabled" | "disabled" | "available"`, `setUserExtensionEnabled()`, `toggleSelectedExtension()`). These are **not** feature-flag enablement checks — they are part of the extension's core data model and UI logic:

- `ManagedExtensionStatus` type defines the display status of a managed extension row.
- `setUserExtensionEnabled(source, enabled)` writes to Nexus user config (a runtime config API from `@nexus/runtime`), not a feature-flag query.
- `toggleSelectedExtension()` toggles the enabled state of a third-party package in the UI.

None of these query whether pi-packages itself (or any sibling extension) is enabled. They operate on **user-configured extension state** stored in Nexus settings, which is distinct from the feature-flag system that gates extension loading.

### Cross-extension dependencies

The extension imports from two categories of external packages:

| Category | Packages | Type |
|----------|----------|------|
| Shared pi packages | `@earendil-works/pi-coding-agent`, `@earendil-works/pi-tui` | Runtime + types |
| Nexus packages | `@nexus/runtime`, `@nexus/tui-kit` | Runtime + types |

None of these are sibling extensions. There are no imports from `@extensions/<other-extension>` anywhere in the codebase.

## Wiring Plan

**No injection points needed.** The pi-packages extension has no cross-extension runtime dependencies that require wiring through `registerBundledExtensions()`.

The extension is already cleanly isolated — it only depends on shared infrastructure packages (`@earendil-works/pi-coding-agent`, `@nexus/runtime`, `@nexus/tui-kit`), all of which are imported by many other extensions and are resolved through the shared package registry.

## Conclusion

**The pi-packages extension is clean.** It contains zero redundant feature-flag enablement checks, zero sibling extension imports, and zero cross-extension runtime dependencies. It can be left as-is without any refactoring.
