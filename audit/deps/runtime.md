# Audit: runtime

## Scope

Files audited:

- `packages/extension-core/runtime/src/index.ts` — re-exports only
- `packages/extension-core/runtime/src/registerBundledExtensions.ts` — the central extension registration entrypoint
- `packages/extension-core/runtime/src/createBundledExtensionFactories.ts` — factory wrapper; defers to `registerBundledExtensions`

## Executive Summary

The `runtime` extension is the **central orchestrator** of all extension loading. It does not gate its own enablement (there is no `isRuntimeExtensionFeatureEnabled("runtime")` check), but it does perform **sibling-imports** — statically importing runtime functions from three sibling extensions (`hotkeys`, `slash-menu`, `tron`) and calling them conditionally based on feature-flag state.

This is a **sibling-import** pattern: the runtime extension imports sibling code at the module level, then conditionally invokes it. If the sibling extension is disabled, the imported function still gets evaluated (the import resolves), even though the extension's `register()` function never runs. The imported functions themselves are "cleanup" or "wrapping" helpers that are safe to import regardless, but the pattern creates a compile-time cross-extension dependency that could be eliminated via injection.

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/registerBundledExtensions.ts:2` | `import { clearHotkeysCommandHook } from "@extensions/hotkeys"` | `@extensions/hotkeys` | **sibling-import** | Inject `clearHotkeysCommandHook` via a callback in `registerBundledExtensions()`, or make the hotkeys extension register a cleanup handler that the feature-flags system calls on unload. |
| `src/registerBundledExtensions.ts:3-6` | `import { clearRegisteredSlashCommands, registerSlashCommand } from "@extensions/slash-menu"` | `@extensions/slash-menu` | **sibling-import** | Inject `clearRegisteredSlashCommands` and `registerSlashCommand` as callbacks. The `registerSlashCommand` call is already conditional on `isSlashMenuEnabled` — the import itself is the redundancy. |
| `src/registerBundledExtensions.ts:7` | `import { createTronToolWrappingExtensionApi } from "@extensions/tron"` | `@extensions/tron` | **sibling-import** | Inject `createTronToolWrappingExtensionApi` as a callback. Currently, when `tron` is disabled, this import still resolves at module load time. |
| `src/registerBundledExtensions.ts:9-12` | `import { clearRegisteredToolRecords, createExtensionFeatureFlags, getEnabledExtensionFeatureFlags, setRuntimeExtensionFeatureFlags } from "@nexus/feature-flags"` | `@nexus/feature-flags` | **legitimate** | These are the feature-flags package's own API — runtime is the central loader and must call them. No change needed. |
| `src/registerBundledExtensions.ts:20-21` | Re-export of `createExtensionFeatureFlags`, `getEnabledExtensionFeatureFlags` | `@nexus/feature-flags` | **legitimate** | Backwards-compatibility re-exports for consumers. No change needed. |
| `src/registerBundledExtensions.ts:117` | Dynamic `import("@nexus/feature-flags")` of `createExtensionRegistrationTask` | `@nexus/feature-flags` | **legitimate** | Dynamic import — no compile-time cross-extension dependency. This is the core registration loop. No change needed. |
| `src/createBundledExtensionFactories.ts:18-19` | `await import("./registerBundledExtensions")` | Internal module | **legitimate** | Dynamic import of internal module. No change needed. |

### Detailed analysis of sibling-import findings

#### Finding 1: `clearHotkeysCommandHook` (line 2)

```typescript
import { clearHotkeysCommandHook } from "@extensions/hotkeys";
```

Used at line 55:
```typescript
if (!isSlashMenuEnabled) clearRegisteredSlashCommands();
if (!cliFlags.some((flag) => flag.id === "hotkeys" && flag.enabled))
    clearHotkeysCommandHook();
```

This is a sibling-import. The runtime extension:
1. **Static imports** `clearHotkeysCommandHook` from the hotkeys extension at module load time.
2. **Checks** the hotkeys feature flag at runtime (`!cliFlags.some((flag) => flag.id === "hotkeys" && flag.enabled)`).
3. **Calls** the imported function only if hotkeys is disabled.

**Problem**: The `@extensions/hotkeys` module is resolved and loaded whenever the runtime extension loads, regardless of whether hotkeys is enabled. If hotkeys is disabled, its `registerBundledExtensions` equivalent never runs, but the runtime still imports its cleanup function.

**Fix**: Instead of a static import, the hotkeys extension should register a cleanup callback through the feature-flags registry (e.g., in its `register()` handler, it stores a `cleanup` function on the flag object). When the runtime detects hotkeys is disabled, it calls that cleanup callback. This eliminates the compile-time cross-extension dependency.

#### Finding 2: `clearRegisteredSlashCommands` and `registerSlashCommand` (lines 3–6)

```typescript
import {
  clearRegisteredSlashCommands,
  registerSlashCommand,
} from "@extensions/slash-menu";
```

Used at:
- Line 55: `if (!isSlashMenuEnabled) clearRegisteredSlashCommands();`
- Lines 69–78: Inside a Proxy handler for `registerCommand`, only when `isSlashMenuEnabled`.

**Problem**: Same pattern — the runtime statically imports two functions from slash-menu, then conditionally calls them. The slash-menu extension's module resolves at runtime load time even when slash-menu is disabled.

**Fix**: Register `clearRegisteredSlashCommands` and `registerSlashCommand` as callbacks on the slash-menu extension's feature flag. The runtime calls these callbacks instead of importing from `@extensions/slash-menu`.

#### Finding 3: `createTronToolWrappingExtensionApi` (line 7)

```typescript
import { createTronToolWrappingExtensionApi } from "@extensions/tron";
```

Used at line 58–59:
```typescript
const toolAwarePi = isTronEnabled
  ? createTronToolWrappingExtensionApi(pi)
  : pi;
```

**Problem**: When `tron` is disabled, the runtime still imports and resolves the tron module at load time. The function `createTronToolWrappingExtensionApi` is called only conditionally, but the import is unconditional.

**Fix**: Register `createTronToolWrappingExtensionApi` as a callback on the tron extension's feature flag. The runtime calls this callback only when `isTronEnabled` is true.

## Wiring Plan

### Injection points in `registerBundledExtensions()`

The current signature is:

```typescript
export default async function registerBundledExtensions(
  pi: ExtensionAPI,
  skipExtensions?: string[],
  disabledFeatures?: string[],
  enabledFeatures?: string[],
): Promise<void>
```

Per the constraints, the **external API signature stays the same**. The injection happens through the feature-flag registry's `register` callback — each sibling extension registers its cleanup/wrapping functions as part of its flag entry.

#### Changes to `@nexus/feature-flags` (internal)

1. **Add `cleanup?: () => void` to `ExtensionFeatureFlag` type** (in `packages/feature-flags/src/types.ts`).

2. **Modify `registerBundledExtensions`** (in `packages/feature-flags/src/registerEnabledExtensions.ts` or `registerBundledExtensions.ts`) to call `flag.cleanup()` for disabled extensions during shutdown.

#### Changes per sibling extension

| Extension | Current pattern | New pattern |
|-----------|----------------|-------------|
| `hotkeys` | Exports `clearHotkeysCommandHook()` as a named export | Registers `cleanup: () => clearHotkeysCommandHook()` on its feature flag |
| `slash-menu` | Exports `clearRegisteredSlashCommands()` and `registerSlashCommand()` as named exports | Registers `cleanup: () => clearRegisteredSlashCommands()` and `onRegisterCommand` callback on its feature flag |
| `tron` | Exports `createTronToolWrappingExtensionApi()` as a named export | Registers `createToolWrapper: (pi) => createTronToolWrappingExtensionApi(pi)` on its feature flag |

#### Changes to runtime's `registerBundledExtensions()`

Remove the three sibling imports:

```diff
- import { clearHotkeysCommandHook } from "@extensions/hotkeys";
- import {
-   clearRegisteredSlashCommands,
-   registerSlashCommand,
- } from "@extensions/slash-menu";
- import { createTronToolWrappingExtensionApi } from "@extensions/tron";
```

Access sibling capabilities through the flag objects instead:

```typescript
// Instead of:
const toolAwarePi = isTronEnabled
  ? createTronToolWrappingExtensionApi(pi)
  : pi;

// Use:
const tronFlag = cliFlags.find(f => f.id === "tron");
const toolAwarePi = (tronFlag?.enabled && tronFlag.createToolWrapper)
  ? tronFlag.createToolWrapper(pi)
  : pi;
```

```typescript
// Instead of:
if (!cliFlags.some((flag) => flag.id === "hotkeys" && flag.enabled))
  clearHotkeysCommandHook();

// Use:
const hotkeysFlag = cliFlags.find(f => f.id === "hotkeys");
if (!hotkeysFlag?.enabled) {
  hotkeysFlag?.cleanup?.();
}
```

## Summary Table

| Finding ID | Classification | Severity | Action |
|-----------|---------------|----------|--------|
| 1 | sibling-import (hotkeys) | Medium | Remove import, inject via flag.cleanup |
| 2 | sibling-import (slash-menu) | Medium | Remove import, inject via flag callbacks |
| 3 | sibling-import (tron) | Medium | Remove import, inject via flag.createToolWrapper |
| 4 | legitimate (feature-flags API) | None | No change |
| 5 | legitimate (re-exports) | None | No change |
| 6 | legitimate (dynamic import) | None | No change |

### No own-enablement-checks found

The runtime extension does **not** call `isRuntimeExtensionFeatureEnabled("runtime")` or any equivalent to check its own enablement. It is the central loader — there is no concept of "disabling the runtime" itself. This is correct behavior.
