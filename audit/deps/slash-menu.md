# Audit: slash-menu

## Findings

### 1. `getRegisteredToolRecords()` call in `createActiveLeaves.ts`

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/createActiveLeaves.ts:5` | `import { getRegisteredToolRecords } from "@nexus/feature-flags"` | `@nexus/feature-flags` | **legitimate** | Keep — this is the canonical API for querying registered tool records. The slash-menu needs this data to build tool leaves. However, the call is made at runtime inside `createActiveLeaves()` which is invoked per-menu-level rendering. Since `registerBundledExtensions()` already gates whether the slash-menu extension loads, the data returned here will always be valid. No change needed. |
| `src/createActiveLeaves.ts:69` | `getRegisteredToolRecords()` called at runtime | `@nexus/feature-flags` | **legitimate** | Keep — same reasoning as above. |

### 2. `ToolRegistrationRecord` type import in `createRecordedToolLeaves.ts`

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/createRecordedToolLeaves.ts:1` | `import type { ToolRegistrationRecord } from "@nexus/feature-flags"` | `@nexus/feature-flags` | **type-only** | Safe to keep — this is a TypeScript `type` import, erased at compile time. No runtime dependency. |

### 3. Sibling extension imports — `@extensions/hotkeys`

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/SlashMenuModal.ts:6` | `import { getRegisteredHotkeysShortcuts } from "@extensions/hotkeys"` | `@extensions/hotkeys` | **sibling-import** | Replace with injection. `getRegisteredHotkeysShortcuts()` is called at runtime in `openHotkeysPanel()` to build the HotkeysModal. Wire through `registerBundledExtensions()` by having the hotkeys extension register its getter function on the ExtensionAPI (or via a callback injected into the slash-menu constructor). |
| `src/SlashMenuModal.ts:7` | `import { HotkeysModal } from "@extensions/hotkeys"` | `@extensions/hotkeys` | **sibling-import** | Replace with injection. `HotkeysModal` is instantiated in `openHotkeysPanel()`. Wire through `registerBundledExtensions()` by having the hotkeys extension provide a factory function or the class itself via ExtensionAPI. |

### 4. Sibling extension imports — `@extensions/tron`

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|------------|---------------|
| `src/resume-transcript/readResumeTranscriptLines.ts:2` | `import { renderTranscriptLines } from "@extensions/tron"` | `@extensions/tron` | **sibling-import** | Replace with injection. `renderTranscriptLines()` is called at runtime to render resume transcript lines. Wire through `registerBundledExtensions()` by having the tron extension register its `renderTranscriptLines` function on the ExtensionAPI (or via a callback). |
| `src/resume-transcript/toSessionTranscriptEntries.ts:25` | `import type { TranscriptEntry } from "@extensions/tron"` | `@extensions/tron` | **type-only** | Safe to keep — this is a `type` import, erased at compile time. |

### 5. Sibling extension imports — `@extensions/neo-editor`

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|------------|---------------|
| `src/internal-commands/handleInternalModelCommand.ts:5-6` | `import { getPromptlineRenderRequest, setPromptlineModelOverride } from "@extensions/neo-editor"` | `@extensions/neo-editor` | **sibling-import** | Replace with injection. Both functions are called at runtime during model selection. Wire through `registerBundledExtensions()` by having the neo-editor extension register these functions on the ExtensionAPI. |
| `src/internal-commands/showStartupResumeModal.ts:2` | `import { ensureSubmitTrigger } from "@extensions/neo-editor"` | `@extensions/neo-editor` | **sibling-import** | Replace with injection. `ensureSubmitTrigger()` is called at runtime when a command is picked from the startup resume modal. Wire through `registerBundledExtensions()` via ExtensionAPI. |
| `src/internal-commands/showStartupResumeModal.ts:3` | `import { refreshPromptlineConfig } from "@extensions/neo-editor"` | `@extensions/neo-editor` | **sibling-import** | Replace with injection. `refreshPromptlineConfig()` is called at runtime after command submission. Wire through `registerBundledExtensions()` via ExtensionAPI. |

### 6. Sibling extension imports — `@extensions/tron` (runtime call)

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|------------|---------------|
| `src/applySlashMenuSettingValue.ts:3` | `import { setToolGroupCollapseEnabled } from "@extensions/tron"` | `@extensions/tron` | **sibling-import** | Replace with injection. `setToolGroupCollapseEnabled()` is called at runtime when the "collapseChangelog" setting is toggled. Wire through `registerBundledExtensions()` by having the tron extension register this function on the ExtensionAPI. |

### 7. Barrel re-exports from `@extensions/context-usage` in `index.ts`

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|------------|---------------|
| `src/index.ts:110-116` | Re-exports 7 functions from `@extensions/context-usage` | `@extensions/context-usage` | **sibling-import** | These are barrel re-exports only — no internal slash-menu code uses them. They exist so consumers of `@extensions/slash-menu` can import these utilities. If `@extensions/context-usage` is disabled, these re-exports will cause a module-load failure. Consider making them lazy/optional: wrap in a try-catch or conditional export, or remove if no external consumer depends on them. |

## Summary

| Classification | Count | Files Affected |
|---------------|-------|----------------|
| **sibling-import** | 8 | `SlashMenuModal.ts`, `readResumeTranscriptLines.ts`, `handleInternalModelCommand.ts`, `showStartupResumeModal.ts`, `applySlashMenuSettingValue.ts`, `index.ts` |
| **type-only** | 2 | `createRecordedToolLeaves.ts`, `toSessionTranscriptEntries.ts` |
| **legitimate** | 2 | `createActiveLeaves.ts` (runtime call + import) |

Total: 12 findings across 7 source files (plus `index.ts` re-exports).

---

## Wiring Plan

### Injection Points Needed in `registerBundledExtensions()`

The current `registerBundledExtensions()` function in `packages/extension-core/runtime/src/registerBundledExtensions.ts` creates a `slashAwarePi` proxy around the base `ExtensionAPI`. This is the hook point for injecting sibling-extension dependencies.

#### 1. Hotkeys extension → slash-menu

**Current:** `SlashMenuModal` directly imports and calls `getRegisteredHotkeysShortcuts()` and instantiates `HotkeysModal`.

**Injection proposal:** Extend the `ExtensionAPI` interface (or create a `SlashMenuAPI` interface) with optional methods:

```typescript
interface ExtensionAPI {
  // ... existing methods ...
  getRegisteredHotkeysShortcuts?(): HotkeyShortcut[];
  HotkeysModal?: typeof HotkeysModal;
}
```

In `registerBundledExtensions()`, when the hotkeys extension is enabled, populate these on the `slashAwarePi` proxy. In `SlashMenuModal`, check for the presence of these methods and fall back gracefully if hotkeys is disabled.

#### 2. Tron extension → slash-menu (two usage sites)

**a) `renderTranscriptLines` (resume transcript rendering)**

**Injection proposal:** Add to `ExtensionAPI`:

```typescript
interface ExtensionAPI {
  renderTronTranscriptLines?(theme: Theme, width: number, options: { transcript: TranscriptEntry[] }): string[];
}
```

In `registerBundledExtensions()`, when tron is enabled, attach `tronRenderTranscriptLines` to the proxy. In `readResumeTranscriptLines()`, call `ctx.ui.renderTronTranscriptLines(...)` instead of the direct import.

**b) `setToolGroupCollapseEnabled` (settings toggle)**

**Injection proposal:** Add to `ExtensionAPI`:

```typescript
interface ExtensionAPI {
  setToolGroupCollapseEnabled?(enabled: boolean): void;
}
```

In `registerBundledExtensions()`, when tron is enabled, attach the function to the proxy. In `applySlashMenuSettingValue()`, call `ctx.setToolGroupCollapseEnabled(...)` instead of the direct import.

#### 3. Neo-editor extension → slash-menu (two usage sites)

**a) `getPromptlineRenderRequest` and `setPromptlineModelOverride` (model command)**

**Injection proposal:** Add to `ExtensionAPI`:

```typescript
interface ExtensionAPI {
  getPromptlineRenderRequest?(): (() => void) | undefined;
  setPromptlineModelOverride?(model: Model): void;
}
```

In `registerBundledExtensions()`, when neo-editor is enabled, attach these to the proxy.

**b) `ensureSubmitTrigger` and `refreshPromptlineConfig` (startup resume modal)**

**Injection proposal:** Add to `ExtensionAPI`:

```typescript
interface ExtensionAPI {
  ensureSubmitTrigger?(cwd: string, commandText: string): Promise<void>;
  refreshPromptlineConfig?(cwd: string): Promise<void>;
}
```

In `registerBundledExtensions()`, when neo-editor is enabled, attach these to the proxy.

#### 4. Context-usage barrel re-exports

**Injection proposal:** In `index.ts`, replace the direct re-exports with lazy/conditional exports:

```typescript
let contextUsageExports: Record<string, unknown> | undefined;
try {
  contextUsageExports = await import("@extensions/context-usage");
} catch {
  // context-usage extension not available
}

export const getBranchMessages = contextUsageExports?.getBranchMessages;
// ... etc
```

Or simply remove the re-exports if no external consumers depend on them (verify with `grep` across the codebase — currently only `packages/feature-flags/src/createExtensionRegisterMap.ts` imports from `@extensions/slash-menu` re-exported items, but those are the registration functions, not the context-usage re-exports).

### `registerBundledExtensions()` Changes

The signature must remain unchanged. The changes are internal:

1. After building `slashAwarePi`, when each sibling extension is enabled, attach its runtime functions to the proxy's `ExtensionAPI` methods.
2. When a sibling extension is disabled, the proxy methods will be `undefined`, and slash-menu code should handle this gracefully (skip the feature, or show a "feature not available" notification).

The current `registerBundledExtensions()` already checks `isTronEnabled` and `isSlashMenuEnabled` for conditional behavior — extend this pattern for the new injection points.
