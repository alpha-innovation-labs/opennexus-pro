# Audit: system-prompt

## Scope

All source files under `packages/extension-core/system-prompt/src/`:

- `src/index.ts` — re-exports `registerSystemPromptExtension`
- `src/registerSystemPromptExtension.ts` — registers the system-prompt extension, delegates to `registerPromptsExtension`

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/registerSystemPromptExtension.ts` | `isRuntimeExtensionFeatureEnabled` (none found) | `@nexus/feature-flags` | — | — |
| `src/registerSystemPromptExtension.ts` | `getEnabledExtensionFeatureFlags` (none found) | `@nexus/feature-flags` | — | — |
| `src/registerSystemPromptExtension.ts` | `getRegisteredToolRecords` (none found) | `@nexus/feature-flags` | — | — |
| `src/registerSystemPromptExtension.ts` | `getAllBundledExtensionIds` (none found) | `@nexus/feature-flags` | — | — |
| `src/registerSystemPromptExtension.ts` | `isRuntimeExtensionFeatureEnabled("system-prompt")` (none found) | `@nexus/feature-flags` | — | — |

**No redundant feature-flag enable checks or sibling cross-extension dependencies were found.**

## Summary

The `system-prompt` extension is a thin wrapper that:

1. Re-exports `registerSystemPromptExtension` from `index.ts`
2. Calls `registerPromptsExtension(pi)` from the `@extensions/prompts` sibling extension

It imports **no** functions from `@nexus/feature-flags` and performs **no** runtime checks on its own or any sibling extension's enablement status. There are no compile-time cross-extension dependencies beyond the one delegation to `registerPromptsExtension`.

## Wiring Plan

No injection points are needed. The extension's current single dependency — calling `registerPromptsExtension` — is an internal delegation, not a runtime gating check. If `registerPromptsExtension` itself needs access to feature-flag state in the future, that should be wired through `registerBundledExtensions()` as an injected parameter rather than a static import.
