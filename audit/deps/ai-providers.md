# Audit: ai-providers

## Summary

The `ai-providers` extension is **clean** — it contains **zero** redundant feature-flag enable checks.

The extension does not import from `@nexus/feature-flags`, does not call any feature-flag query functions (`isRuntimeExtensionFeatureEnabled`, `getEnabledExtensionFeatureFlags`, `getRegisteredToolRecords`, `getAllBundledExtensionIds`), and does not statically import any sibling extension's runtime class or function.

All `enabled` references found in the codebase are **provider-level config fields** (the `enabled?: boolean` property on each LLM provider entry in the user's `config.json`), not extension-level feature flag checks. These are the extension's own data domain — reading and writing per-provider enable/disable state in the user config file — and are entirely separate from the feature-flags system that gates extension loading.

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| *(none)* | *(no redundant checks found)* | — | — | — |

## External Dependencies

| Package | Usage | Notes |
|---------|-------|-------|
| `@nexus/runtime` (workspace) | `readNexusUserConfig`, `writeNexusUserConfig`, `getNexusAgentDirPath` | Core runtime config API — not a sibling extension; no feature-flag concern. |
| `@earendil-works/pi-coding-agent` | `ExtensionAPI` (type-only import in 5 files) | Type-only import — erased at compile time. Safe. |

## Classification Details

### What was checked (and found clean)

1. **Feature-flag imports from `@nexus/feature-flags`** — None found.
2. **Calls to `isRuntimeExtensionFeatureEnabled()`** — None found.
3. **Calls to `getEnabledExtensionFeatureFlags()`** — None found.
4. **Calls to `getRegisteredToolRecords()`** — None found.
5. **Calls to `getAllBundledExtensionIds()`** — None found.
6. **Static imports of sibling extension runtime classes** — None found. All imports are either internal (`../config/...`, `../gateway/...`) or to `@nexus/runtime` (a workspace dependency, not a sibling extension) and `@earendil-works/pi-coding-agent` (type-only).

### What the `enabled` field references are (not flagged)

The following files reference `enabled` but this is **provider config state**, not extension feature-flag gating:

- `src/config/types.ts` — Defines `ProviderConfig.enabled?: boolean` (the type).
- `src/config/readProviderConfig.ts` — Skips config entries that only have `{ enabled: false }` without host/port (filtering logic).
- `src/config/toggleProviderEnabled.ts` — Reads/writes `providers.<id>.enabled` in the user config file.
- `src/config/writeProviderConfig.ts` — Casts provider config as `{ enabled: boolean }` when writing.

These are the extension's own data domain — managing per-provider enable/disable state in `config.json`. They do not call into the feature-flags system and do not gate extension loading.

## Wiring Plan

No injection points are needed. The extension has no cross-extension runtime dependencies and no redundant feature-flag checks.
