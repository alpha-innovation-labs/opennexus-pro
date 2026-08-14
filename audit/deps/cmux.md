# Audit: cmux

## Summary

Scanned 108 TypeScript source files in `packages/extension-core/cmux/src/` for:

- Feature-flag enablement checks (`isRuntimeExtensionFeatureEnabled`, `getEnabledExtensionFeatureFlags`, etc.)
- Feature-flags package imports (`@nexus/feature-flags`)
- Sibling extension runtime imports (`@extensions/<name>`)
- Type-only imports (exempt from findings)

### Findings: 1

The cmux extension has **no internal feature-flag enablement checks** — it does not call `isRuntimeExtensionFeatureEnabled()`, `getEnabledExtensionFeatureFlags()`, or any other function from `@nexus/feature-flags`. This is correct.

However, it has **one sibling-import finding** that creates a compile-time cross-extension dependency.

---

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/command/registerCmuxCommand.ts:5` | `import { withSlashMenuGroup }` (runtime import) | `@extensions/slash-menu` | **sibling-import** | Replace with injection (see Wiring Plan below) |

### Detail

**File:** `packages/extension-core/cmux/src/command/registerCmuxCommand.ts`  
**Line:** 5  
**Import:** `import { withSlashMenuGroup } from "@extensions/slash-menu";`  
**Usage:** Line 16 — wraps the `/cmux` command definition: `withSlashMenuGroup({ description: ..., handler: ... }, "Extensions")`

This is a runtime (non-type) import of a sibling extension's function. Because it is a top-level static import:

1. The `slash-menu` module's code is loaded at cmux module initialization time, **regardless** of whether `slash-menu` is enabled in the feature-flag system.
2. If `slash-menu` is disabled via feature flag, the cmux extension still imports and loads the entire `slash-menu` module, wasting startup time and memory.
3. The `registerBundledExtensions()` proxy (`slashAwarePi`) that intercepts `registerCommand` only matters when `registerCommand` is called — but the import itself executes unconditionally.

This import is also declared in `cmux`'s `package.json` as a runtime dependency:

```json
"@extensions/slash-menu": "workspace:*"
```

---

## Wiring Plan

### Injection point for `withSlashMenuGroup`

In `registerBundledExtensions()`, when constructing the `createExtensionRegistrationTask` call, pass a `slashMenu`-aware extension API to the cmux registration function.

**Option A — Augment the ExtensionAPI proxy (preferred):**

Extend the `slashAwarePi` proxy (already created in `registerBundledExtensions.ts`) to expose `withSlashMenuGroup` as a property:

```typescript
const slashAwarePi = new Proxy(toolAwarePi, {
  get(target, property, receiver) {
    if (property === "registerCommand") {
      // ... existing proxy logic ...
    }
    // NEW: expose withSlashMenuGroup when slash-menu is enabled
    if (property === "withSlashMenuGroup" && isSlashMenuEnabled) {
      return require("@extensions/slash-menu").withSlashMenuGroup;
    }
    return Reflect.get(target, property, receiver);
  },
});
```

Then in `registerCmuxCommand.ts`, replace the static import with `pi.withSlashMenuGroup`:

```typescript
// BEFORE (static import):
// import { withSlashMenuGroup } from "@extensions/slash-menu";

// AFTER (injected via API):
export function registerCmuxCommand(pi: ExtensionAPI): void {
  const slashMenuGroup = (pi as any).withSlashMenuGroup;
  pi.registerCommand(
    "cmux",
    slashMenuGroup
      ? slashMenuGroup(
          { description: "...", handler: async () => {...} },
          "Extensions",
        )
      : { description: "...", handler: async () => {...} },
  );
}
```

**Option B — Pass a helper object to `registerCmuxExtension`:**

Extend the `registerCmuxExtension(pi)` signature to accept a feature-aware config object:

```typescript
// In registerBundledExtensions.ts:
const slashMenuHelper = isSlashMenuEnabled
  ? { withSlashMenuGroup: withSlashMenuGroup }
  : undefined;
registerCmuxExtension(pi, { slashMenuHelper });
```

```typescript
// In registerCmuxExtension.ts:
export function registerCmuxExtension(
  pi: ExtensionAPI,
  opts?: { slashMenuHelper?: { withSlashMenuGroup: typeof withSlashMenuGroup } },
): void {
  const { withSlashMenuGroup } = opts?.slashMenuHelper ?? {};
  registerCmuxCommand(pi, withSlashMenuGroup);
}
```

### No changes needed for `registerBundledExtensions()` signature

Per constraints, `registerBundledExtensions()`'s external API (its signature) remains unchanged. Only what it passes internally to `registerCmuxExtension` changes.

### No other wiring needed

The cmux extension has no other sibling extension runtime imports or feature-flag enablement checks. The `@nexus/runtime` and `@nexus/tui-kit` imports are core packages, not sibling extensions, and are not feature-flag-gated.

---

## Exempt files (no findings)

The following files were checked but contain no feature-flag references or sibling extension imports:

- `src/index.ts` — re-exports only
- `src/registerCmuxExtension.ts` — extension registration, no feature checks
- `src/notifyCmuxPaneCompletion.ts` — runtime logic only
- `src/syncCmuxPaneTitle.ts` — runtime logic only
- `src/runtime/*.ts` (8 files) — command execution, no feature checks
- `src/session-registry/*.ts` (27 files) — session management, no feature checks
- `src/snapshots/*.ts` (14 files) — snapshot persistence, no feature checks
- `src/state/*.ts` (3 files) — internal title-sync state (not feature-flags)
- `src/ui/*.ts` (2 files) — UI modals, no feature checks
- `src/workspace-cache/*.ts` (8 files) — cache management, no feature checks
- `src/workspaces/*.ts` (15 files) — workspace listing/formatting, no feature checks
