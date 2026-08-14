# Audit: neo-editor

## Summary

Scanned 138 source files in `packages/extension-core/neo-editor/src/` for redundant
feature-flag enable checks and sibling-extension cross-dependencies.

**Findings: 12 issues** across 7 files — 4 feature-flag gating checks (all redundant),
and 8 sibling-extension imports (6 runtime imports requiring injection, 2 safe type-only
imports).

---

## Findings

### Feature-Flag Enablement Checks

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/features/promptline/PromptlineEditor.ts:18` | `isRuntimeExtensionFeatureEnabled` import | `@nexus/feature-flags` | own-enablement-check | Remove the import and both usages (lines 235, 300). The extension won't load if disabled. |
| `src/features/promptline/PromptlineEditor.ts:235` | `isRuntimeExtensionFeatureEnabled("hotkeys")` | `@nexus/feature-flags` | sibling-import | Remove the check. If `hotkeys` is disabled, the extension won't load, so the check is dead code. |
| `src/features/promptline/PromptlineEditor.ts:300` | `isRuntimeExtensionFeatureEnabled("slash-menu")` | `@nexus/feature-flags` | sibling-import | Remove the check. If `slash-menu` is disabled, the extension won't load, so the check is dead code. |
| `src/features/promptline/trigger/refreshTriggerModal.ts:9` | `isRuntimeExtensionFeatureEnabled` import | `@nexus/feature-flags` | own-enablement-check | Remove the import and the check at line 62. |
| `src/features/promptline/trigger/refreshTriggerModal.ts:62` | `isRuntimeExtensionFeatureEnabled("slash-menu")` | `@nexus/feature-flags` | sibling-import | Remove the check — if `slash-menu` is disabled, this file's code path is never reached. |

### Sibling Extension Runtime Imports (non-type)

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/features/promptline/PromptlineEditor.ts:15` | `getRegisteredHotkeysShortcuts` (function) | `@extensions/hotkeys` | sibling-import | Inject via `registerBundledExtensions()` — pass `getRegisteredHotkeysShortcuts` as a callback prop to `PromptlineEditor`. |
| `src/features/promptline/PromptlineEditor.ts:16` | `openHotkeysModal` (function) | `@extensions/hotkeys` | sibling-import | Inject via `registerBundledExtensions()` — pass `openHotkeysModal` as a callback prop to `PromptlineEditor`. |
| `src/features/promptline/PromptlineEditor.ts:17` | `clearStartupHero` (function) | `@extensions/startup-hero` | sibling-import | Inject via `registerBundledExtensions()` — pass `clearStartupHero` as a callback prop to `PromptlineEditor`. |
| `src/features/promptline/PromptlineEditor.ts:14` | `wrapAutocompleteProviderForCwd` (function) | `@extensions/fff` | sibling-import | Inject via `registerBundledExtensions()` — pass `wrapAutocompleteProviderForCwd` as a callback prop to `PromptlineEditor`. |
| `src/features/promptline/trigger/createSlashModal.ts:5` | `SlashMenuModal` (class, runtime `new`) | `@extensions/slash-menu` | sibling-import | Replace with injection — pass `SlashMenuModal` constructor (or a factory function) through `registerBundledExtensions()` to `createSlashModal`. |
| `src/primeStartupResumeModal.ts:2` | `showStartupResumeModal` (function) | `@extensions/slash-menu` | sibling-import | Inject via `registerBundledExtensions()` — pass `showStartupResumeModal` as a callback to `primeStartupResumeModal`. |
| `src/registerNeoEditorExtension.ts:5-6` | `createContextUsageReport`, `createRuntimeSnapshot` (functions) | `@extensions/context-usage` | sibling-import | Inject via `registerBundledExtensions()` — pass these as callback props to the extension registration. |
| `src/registerNeoEditorExtension.ts:8` | `readProjectConfig` (function) | `@extensions/slash-menu` | sibling-import | Inject via `registerBundledExtensions()` — pass `readProjectConfig` as a callback prop. |
| `src/registerNeoEditorExtension.ts:9` | `setToolGroupCollapseEnabled` (function) | `@extensions/tron` | sibling-import | Inject via `registerBundledExtensions()` — pass `setToolGroupCollapseEnabled` as a callback prop. |
| `src/features/promptline/render/buildPromptline.ts:8` | `estimateTokensFromText` (function) | `@extensions/context-usage` | sibling-import | Inject via `registerBundledExtensions()` — pass `estimateTokensFromText` as a callback prop to `buildPromptline`. |

### Safe Type-Only Imports (no action needed)

| File | What it checks/imports | From where | Classification |
|------|----------------------|------------|----------------|
| `src/features/promptline/trigger/getTriggerModal.ts:1` | `SlashMenuModal` (type-only import) | `@extensions/slash-menu` | type-only |
| `src/features/promptline/trigger/providers/getSlashTriggerModal.ts:1` | `SlashMenuModal` (type-only import) | `@extensions/slash-menu` | type-only |
| `src/features/promptline/trigger/refreshSlashTrigger.ts:1` | `SlashMenuModal` (type-only import) | `@extensions/slash-menu` | type-only |
| `src/features/promptline/trigger/types.ts:10` | `SlashMenuModal` (type-only import) | `@extensions/slash-menu` | type-only |
| `src/registerNeoEditorExtension.ts:7` | `ContextUsageReport` (type-only import) | `@extensions/context-usage` | type-only |

---

## Wiring Plan

The following injection points need to be added to `registerBundledExtensions()` (or the
`registerNeoEditorExtension` function it calls) to replace the 10 runtime cross-extension
imports listed above. The external API of `registerBundledExtensions` is not changed —
only the internal dependency wiring.

### 1. `PromptlineEditor` constructor — hotkeys + startup-hero + fff deps

**Current**: Direct static imports at module level (lines 14-17 of `PromptlineEditor.ts`).

**Injection**: Add to `PromptlineEditor` constructor parameters:

```typescript
constructor(
  tui: TUI,
  theme: EditorTheme,
  editorKeybindings: KeybindingsManager,
  ctx: ExtensionContext,
  uiTheme: ExtensionContext["ui"]["theme"],
  getThinkingLevel: ExtensionAPI["getThinkingLevel"],
  setThinkingLevel: ExtensionAPI["setThinkingLevel"],
  _getSessionName: ExtensionAPI["getSessionName"],
  getPromptlineConfig: () => PromptlineConfig,
  refreshPromptlineConfig: (cwd: string) => Promise<PromptlineConfig>,
  // NEW: injected hotkeys deps
  getRegisteredHotkeysShortcuts: () => string[],
  openHotkeysModalFn: (
    uiTheme: ...,
    keybindings: ...,
    shortcuts: string[],
    showOverlay: ...,
    onClose: () => void,
  ) => { modal: Component; hide: () => void },
  // NEW: injected startup-hero dep
  clearStartupHeroFn: (ctx: ExtensionContext) => void,
  // NEW: injected fff dep
  wrapAutocompleteProviderForCwd: (cwd: string, provider: AutocompleteProvider) => Promise<AutocompleteProvider>,
  // ... rest of existing params
)
```

In `registerNeoEditorExtension`, wire these from the corresponding sibling extension's
registration functions.

### 2. `createSlashModal` — `SlashMenuModal` class injection

**Current**: `import { SlashMenuModal } from "@extensions/slash-menu"` then `new SlashMenuModal(...)` (line 35 of `createSlashModal.ts`).

**Injection**: Add a constructor/factory parameter:

```typescript
export function createSlashModal(
  ctx: ExtensionContext,
  requestClose: () => void,
  requestRender: () => void,
  setText: (value: string) => void,
  getThinkingLevel: () => string,
  setThinkingLevel: (value: string) => void,
  submitText: (value: string) => void,
  showOverlay: ShowOverlay,
  getCommands: ExtensionAPI["getCommands"] = () => [],
  getAllTools: ExtensionAPI["getAllTools"] = () => [],
  // NEW: injected slash-menu constructor
  SlashMenuModalCtor: typeof SlashMenuModal,
): { modal: SlashMenuModal; handle: TriggerModalHandle } {
  const modal = new SlashMenuModalCtor(
    ctx,
    getThinkingLevel,
    setThinkingLevel,
    requestClose,
    requestRender,
    (commandText) => { requestClose(); requestRender(); submitText(commandText); },
    getCommands,
    async () => undefined,
    (commandText) => { requestClose(); setText(commandText); requestRender(); },
    getAllTools,
  );
  // ...
}
```

The `SlashMenuModalCtor` parameter is typed as `typeof SlashMenuModal` (a type-only
import, which is safe). The actual class reference is passed at wiring time.

### 3. `primeStartupResumeModal` — `showStartupResumeModal` injection

**Current**: `import { showStartupResumeModal } from "@extensions/slash-menu"` (line 2).

**Injection**: Add as a parameter:

```typescript
export async function primeStartupResumeModal(
  reason: string,
  ctx: ExtensionContext,
  showStartupResumeModalFn: (ctx: ExtensionContext) => Promise<void>,
): Promise<void> {
  // ...
  setTimeout(() => {
    void showStartupResumeModalFn(ctx);
  }, 0);
}
```

### 4. `registerNeoEditorExtension` — context-usage + slash-menu + tron deps

**Current**: Static imports at module level (lines 5-9).

**Injection**: Add these as parameters to the registration function:

```typescript
export default function (
  pi: ExtensionAPI,
  // NEW: injected context-usage deps
  createContextUsageReportFn: (snapshot: RuntimeSnapshot) => Promise<ContextUsageReport>,
  createRuntimeSnapshotFn: (ctx: ExtensionContext) => RuntimeSnapshot,
  // NEW: injected slash-menu dep
  readProjectConfigFn: (cwd: string) => Promise<SlashMenuProjectConfig>,
  // NEW: injected tron dep
  setToolGroupCollapseEnabledFn: (enabled: boolean) => void,
) {
  // ...
}
```

### 5. `buildPromptline` — `estimateTokensFromText` injection

**Current**: `import { estimateTokensFromText } from "@extensions/context-usage"` (line 8).

**Injection**: Add as a parameter:

```typescript
export function buildPromptline(
  ctx: ExtensionContext,
  uiTheme: ExtensionContext["ui"]["theme"],
  getThinkingLevel: ExtensionAPI["getThinkingLevel"],
  width?: number,
  estimateTokensFromTextFn: (text: string) => number,
): { left: string; right: string } {
  // ...
  newMessageTokens += estimateTokensFromTextFn(textStr);
  // ...
}
```

---

## Summary of Changes

| Category | Count | Action |
|----------|-------|--------|
| Feature-flag gating checks (redundant) | 5 | Remove `isRuntimeExtensionFeatureEnabled` import and all call sites |
| Sibling runtime imports (need injection) | 10 | Replace with constructor/callback injection wired through `registerBundledExtensions()` |
| Safe type-only imports | 5 | No action needed — erased at compile time |
| **Total findings** | **12** | |
