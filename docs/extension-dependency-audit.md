# Extension Dependency Audit: Breaking Cycles & Removing Redundant Gating

## Executive Summary

The extension-core packages suffer from two intertwined problems:

1. **Circular static imports** — extensions import each other's runtime classes directly, creating compile-time dependency cycles.
2. **Redundant feature-flags enable checks** — extensions check whether they (or siblings) are enabled before executing, even though `feature-flags` already gates loading at the registry level.

These are the same problem viewed from different layers: the symptom is circular imports, the root cause is that extensions reach into each other's internals instead of using the registration system that `feature-flags` already provides.

The fix for all extensions is the same pattern: **replace static cross-extension imports with runtime injection via `registerBundledExtensions()`**, and **remove all redundant enablement checks**.

---

## Part 1: The Root Cause

### How Feature-Flags Already Solves This

The `feature-flags` package is the gatekeeper. It owns:

- `createExtensionRegisterMap()` — imports every extension's registration function
- `registerBundledExtensions()` — decides at runtime which extensions actually load

**If an extension is disabled in feature-flags, its code never runs. Period.**

This means any internal check an extension makes to see whether it (or a sibling) is enabled is redundant — the feature-flags system already gates loading. If the extension is disabled, it won't be registered, so the check will never be reached.

### The Current Broken Pattern

Extensions import each other's **runtime classes** (not just registration functions), creating compile-time cycles:

```
slash-menu → hotkeys (imports HotkeysModal class) → feature-flags → mini-apps → slash-menu  ← CYCLE
neo-editor → slash-menu (reads/writes internal state) → neo-editor  ← CYCLE
```

The problem: `feature-flags` already imports the *registration function* at the registry level, but extensions import the *runtime class* directly. This is the wrong layer of dependency.

---

## Part 2: Concrete Example — promptline-state Extraction

The neo-editor ↔ slash-menu cycle is the tightest and most blocking. Here's the pattern applied to it.

### The Core Problem

`slash-menu` imports from `@extensions/neo-editor` to call four functions that are all about state access and side-effect execution, not UI rendering:

| Function | What it does | Why it's a problem |
|---|---|---|
| `setPromptlineModelOverride(model)` | Writes to a module-level let | slash-menu mutates neo-editor's internal state |
| `getPromptlineRenderRequest()` | Reads a module-level let | slash-menu reads neo-editor's internal state |
| `ensureSubmitTrigger(cwd, text)` | Writes to a config file on disk | slash-menu performs a side effect in neo-editor's domain |
| `refreshPromptlineConfig(cwd)` | Reads + caches config on disk | slash-menu performs a side effect in neo-editor's domain |

### The Fix: A promptline-state Package

Create a new package `packages/extension-core/promptline-state/` that exports the state management as a **neutral shared layer**:

```
promptline-state/
  src/
    state.ts            ← the singleton state (moved from neo-editor)
    triggers.ts         ← ensureSubmitTrigger, readEditorTriggerConfig (moved from neo-editor)
    index.ts            ← re-exports
```

`state.ts` — module-level singletons, shared not owned:

```typescript
let promptlineModelOverride: ExtensionContext["model"] | undefined;
let requestPromptlineRender: ((force?: boolean) => void) | undefined;
let promptlineInstalledForSession: string | null = null;
let refreshRequestCallback: (() => void) | undefined;
let usageRenderUnsubscribe: (() => void) | undefined;

export function setPromptlineModelOverride(...) { ... }
export function getPromptlineRenderRequest() { ... }
export function setPromptlineRenderRequest(...) { ... }
// ... etc.
```

`triggers.ts` — same `ensureSubmitTrigger`, but now from `promptline-state`, not `neo-editor`.

### Dependency Graph

```
Before:
  neo-editor  →  slash-menu  →  neo-editor    ← CYCLE
  slash-menu  →  hotkeys     →  feature-flags  →  mini-apps →  slash-menu  ← CYCLE

After:
  neo-editor  →  promptline-state  ←  slash-menu    ← CYCLE BROKEN
  slash-menu  →  hotkeys           →  feature-flags  →  mini-apps  →  slash-menu  ← STILL A CYCLE
```

Cycle 1 is completely eliminated. Both `neo-editor` and `slash-menu` depend on `promptline-state` unidirectionally.

### Cycle 2: Runtime Registration Pattern

Cycle 2 (slash-menu → hotkeys → feature-flags → mini-apps → slash-menu) is a configuration surface loop. The fix:

1. Define minimal interfaces (`HotkeysModalLike`, `MiniAppsMenuHandler`) in `slash-menu/src/types.ts`
2. Have `hotkeys` and `mini-apps` register their implementations via a registration function exported by `slash-menu`
3. Remove the static imports from `slash-menu/src/SlashMenuModal.ts`

This turns Cycle 2 from static imports into **runtime registration** — the same pattern `slash-menu` already uses for dynamic slash commands (`getDynamicSlashCommands`).

### Full Architecture After Both Fixes

```
                  ┌─────────────────┐
                  │  promptline-    │
                  │   state         │
                  │  (new package)  │
                  └────────┬────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
     ┌─────────────┐              ┌─────────────┐
     │  neo-editor │              │  slash-menu │
     └─────────────┘              └──────┬──────┘
                                        │
                   ┌───────────────────────┤
                   ▼                       ▼
            ┌─────────────┐       ┌─────────────┐
            │   hotkeys   │       │  mini-apps  │
            └──────┬──────┘       └──────┬──────┘
                   │                      │
                   ▼                      ▼
            ┌─────────────┐       ┌─────────────┐
            │ feature-    │       │  (none)     │
            │   flags     │       └─────────────┘
            └─────────────┘
```

Key properties:
- No package depends on another in a cycle
- `promptline-state` is the single source of truth for promptline mutable state
- `slash-menu` uses runtime registration (not static imports) to interact with hotkeys and mini-apps
- Adding a new feature means registering a handler — no new static imports needed

---

## Part 3: Audit Plan — Apply to ALL Extensions

Every package in `@packages/extension-core/` that checks whether it or a sibling extension is enabled (via feature-flags) before executing contains redundant logic. The fix is the same for all.

### What To Do

1. **Audit every package** in `@packages/extension-core/` for feature-flags enable checks — code that asks whether an extension is enabled before proceeding.

2. **For each such check**, classify:
   - **Own-enablement-check** — the extension checks if it is enabled → remove the check entirely
   - **Sibling-import** — the extension imports a sibling's runtime class/function → replace with injection or callback
   - **Type-only** — just a type import → move to a shared types file (safe, no cycle)

3. **Create a wiring plan** for `registerBundledExtensions()` that passes the required dependencies to each extension's entry point.

4. **Execute the changes** — remove all redundant feature-flags enable checks, replace static cross-extension class/function imports with injection, update `registerBundledExtensions()` to wire them.

### Key Constraint

Do NOT change `registerBundledExtensions()`'s external API (its signature). Only change what it passes internally. The feature-flags system must remain the single source of truth for what loads.

### Output Format

For each extension that has redundant feature-flags checks or static cross-extension imports:
- Extension name
- Each problematic check or import (source file, what it checks/imports, from where)
- Classification: own-enablement-check / sibling-import / type-only
- Suggested injection point (constructor, config object, callback)
- Files that need changes

Then provide the consolidated `registerBundledExtensions()` wiring plan.

---

## Part 4: Migration Steps (Incremental, Safe)

### Phase 1 — promptline-state (Cycle 1)

1. Create `promptline-state` package — copy `state.ts` and `ensureSubmitTrigger.ts` from `neo-editor`
2. Update `neo-editor` — import from `@extensions/promptline-state` instead of its own local files
3. Update `slash-menu` — import from `@extensions/promptline-state` instead of `@extensions/neo-editor`
4. Remove the `@extensions/neo-editor` dependency from `slash-menu`'s `package.json`
5. Verify — `just dev` should still work; all slash menu flows (model select, resume, settings) should function identically

### Phase 2 — Runtime Registration (Cycle 2)

1. Define minimal interfaces (`HotkeysModalLike`, `MiniAppsMenuHandler`) in `slash-menu/src/types.ts`
2. Have `hotkeys` and `mini-apps` register their implementations via a registration function exported by `slash-menu`
3. Remove the static imports from `slash-menu/src/SlashMenuModal.ts`
4. Verify all menu sub-flows (hotkeys modal, mini-apps modal) still work

### Phase 3 — Audit Remaining Extensions

Apply the same audit-and-replace pattern to all other extensions in `@packages/extension-core/`.

---

## Why This Is The Right Approach

- **Eliminates the tightest cycle** (the one that blocks most refactoring)
- **Uses runtime registration** for the remaining cycles (the pattern the codebase already uses for dynamic commands)
- **Creates a reusable package** (`promptline-state`) that any future extension could depend on without creating cycles
- **Removes dead code** — redundant enablement checks that can never be reached
- **Requires zero behavioral changes** — the state semantics and registration behavior stay exactly the same
- **Scalable** — adding a new extension means registering a handler, not importing anything
