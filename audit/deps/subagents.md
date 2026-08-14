# Audit: subagents

## Scope

All source files in `packages/extension-core/subagents/src/`:

- `index.ts`
- `registerSubagentsExtension.ts`
- `tools/registerSubagentPromptTool.ts`
- `tools/registerSubagentReadTool.ts`
- `tools/registerSubagentSendKeysTool.ts`
- `tools/registerSubagentSendTool.ts`
- `tools/registerSubagentStartTool.ts`

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| None | — | — | — | **No redundant feature-flag checks found.** |

## Analysis Details

### Feature-flag imports
The subagents extension does **not** import or reference `@nexus/feature-flags` in any source file. Specifically, none of the following are used:

- `isRuntimeExtensionFeatureEnabled()`
- `getEnabledExtensionFeatureFlags()`
- `getRegisteredToolRecords()`
- `getAllBundledExtensionIds()`

### Cross-extension imports
The subagents extension does **not** import from any sibling extension (e.g., `@extensions/hotkeys`, `@extensions/tron`, `@extensions/slash-menu`). All imports are either:

- **Internal** — tool registration functions imported from sibling files within the same extension (e.g., `registerSubagentStartTool` imported by `registerSubagentsExtension`). These are intra-extension and not cross-extension dependencies.
- **Type-only** — `ExtensionAPI` type from `@earendil-works/pi-coding-agent`.
- **External packages** — `@earendil-works/pi-ai`, `@earendil-works/pi-coding-agent`, `@nexus/herdr`, and `node:crypto`.

### No enablement checks
No source file calls `isRuntimeExtensionFeatureEnabled("subagents")` or any equivalent check to gate its own code. The extension loads (or does not) entirely based on the feature-flags system's `registerBundledExtensions()` → `createExtensionRegistrationTask()` flow.

### No sibling enablement checks
No source file checks whether other extensions (e.g., `tron`, `hotkeys`, `slash-menu`) are enabled before executing code.

## Wiring Plan

**No changes needed.** The subagents extension is a clean case — it has no redundant feature-flag enablement checks and no cross-extension runtime dependencies. Its `registerSubagentsExtension()` function is already the clean registration target that `createExtensionRegisterMap()` references directly:

```
// packages/feature-flags/src/createExtensionRegisterMap.ts:60
subagents: registerSubagentsExtension,
```

The extension's internal intra-module imports (tool registration functions imported into `registerSubagentsExtension`) are appropriate and should remain — they are not cross-extension dependencies.
