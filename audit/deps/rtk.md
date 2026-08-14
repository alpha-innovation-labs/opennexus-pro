# Audit: rtk

## Scope

All source files in `packages/extension-core/rtk/src/` (recursively), including:

- `index.ts` — barrel exports
- `registerRtkExtension.ts` — extension registration entry point
- `command/`, `pricing/`, `runtime/`, `savings/`, `tooling/`, `ui/`, `usage/` — all internal modules

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| *(none)* | — | — | — | — |

**No redundant feature-flag enable checks were found in the rtk extension.**

### Cross-extension imports (non-feature-flag)

| File | What it imports | From where | Classification | Notes |
|------|----------------|------------|----------------|-------|
| `src/tooling/createRtkBuiltInTools.ts` | `import type { BuiltInTools }` | `@extensions/tron` | **type-only** | Type-only import — erased at compile time. Safe to keep. |
| `src/command/registerSavingsCommand.ts` | `import { withSlashMenuGroup }` | `@extensions/slash-menu` | **legitimate** | Utility function for slash-command grouping. Not a feature-flag gate. This is a cross-extension dependency for shared behavior, not feature-flag gating. |

### Summary of what was checked

1. **`isRuntimeExtensionFeatureEnabled()`** — Not imported or called anywhere in rtk.
2. **`getEnabledExtensionFeatureFlags()`** — Not imported or called anywhere in rtk.
3. **`getRegisteredToolRecords()`** — Not imported or called anywhere in rtk.
4. **`getAllBundledExtensionIds()`** — Not imported or called anywhere in rtk.
5. **`@nexus/feature-flags` or `@earendil-works/feature-flags`** — No imports from the feature-flags package anywhere in rtk.
6. **Sibling extension runtime imports** — None. The only cross-extension imports are `@extensions/tron` (type-only) and `@extensions/slash-menu` (utility function, not feature-gated).
7. **Internal enablement checks** — No conditional code within rtk gates behavior on whether rtk (or any sibling) is enabled.

## Wiring Plan

No injection points needed. The rtk extension does not reference the feature-flags system internally at all. Its registration function `registerRtkExtension()` is called by `registerEnabledExtensions()` only when rtk's feature flag evaluates to enabled. No changes required.

## Conclusion

The rtk extension is **clean** — it contains zero redundant feature-flag enable checks. It trusts the feature-flags system's gate at the registration level (`registerEnabledExtensions()` → `createExtensionRegistrationTask()` → `flag.register()`), and does not duplicate any enablement logic internally.

The two cross-extension imports (`@extensions/tron` and `@extensions/slash-menu`) are unrelated to feature-flag gating and are legitimate dependencies.
