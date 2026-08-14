# Audit: context-usage

## Summary

The **context-usage** extension is a clean-room audit subject. After reading all 42 source files in `packages/extension-core/context-usage/src/` (recursively), **zero redundant feature-flag enable checks were found.**

This extension does not import `@nexus/feature-flags` at all, does not call `isRuntimeExtensionFeatureEnabled()`, `getEnabledExtensionFeatureFlags()`, `getRegisteredToolRecords()`, or `getAllBundledExtensionIds()`, and does not statically import any sibling extension's runtime class or function.

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| *(none)* | *(no redundant checks found)* | — | — | — |

## Import Inventory

The extension imports from four external scopes, none of which are `@nexus/feature-flags`:

| Import scope | Files | Purpose |
|---|---|---|
| `@earendil-works/pi-coding-agent` | Multiple | Platform API (`ExtensionAPI`, `ExtensionContext`, `BuildSystemPromptOptions`, `ExtensionCommandContext`) |
| `@nexus/tui-kit` | `ContextUsageModal.ts`, `showContextUsageCommand.ts`, `renderThemedContextUsageRows.ts`, `renderThemedContextUsageMeter.ts`, `formatThemedDetailSection.ts`, `getContextUsageMarkerColor.ts` | TUI components (`SharedModal`, `createPanelOverlayOptions`, `SharedModalTheme`) |
| `@nexus/pi-platform` | `pi/createPiBuiltinToolItems.ts` | Pi tool definitions (`createPiToolDefinitions`, `PiToolDefinition`) |
| `@extensions/neo-editor` | `renderNeoContextMeter.ts` | Editor color helpers (`RESET`, `getContextColor`) |
| `node:fs` | `readTextFile.ts` | File I/O (`existsSync`, `readFileSync`) |

All intra-extension imports are internal (`./...`) and are not cross-extension dependencies.

## Wiring Plan

No injection points are needed. The extension has no cross-extension runtime dependencies and no feature-flag gating logic to remove or replace.

The `registerContextUsageExtension()` function (in `registerContextUsageExtension.ts`) registers its command and event handlers directly via the `ExtensionAPI` interface. It does not query whether itself or any sibling extension is enabled.

## Conclusion

**context-usage is clean.** No audit findings. No changes required. No wiring plan needed.
