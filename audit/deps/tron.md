# Audit: tron

## Summary

The tron extension does **not** use the feature-flags system internally (`isRuntimeExtensionFeatureEnabled`, `getEnabledExtensionFeatureFlags`, `getRegisteredToolRecords`, `getAllBundledExtensionIds`, or `isBundledExtension`). It does not check its own enablement status, nor does it gate any runtime behavior on feature-flag queries.

However, tron has **static cross-extension imports** from the sibling `rtk` extension (`@extensions/rtk`), importing runtime functions that are gated by a feature flag. This creates a compile-time coupling between tron and rtk that bypasses the feature-flags loading gate.

---

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/compact-tool-lines/createBuiltInTools.ts` | `import { getRtkRuntimeForCwd } from "@extensions/rtk"` | `@extensions/rtk` (runtime store) | **sibling-import** | Replace with injection: pass `getRtkRuntimeForCwd` as a callback to `createBuiltInTools()` via `registerBundledExtensions()`. |
| `src/compact-tool-lines/createBuiltInTools.ts` | `import { createRtkBuiltInTools } from "@extensions/rtk"` | `@extensions/rtk` (tool factory) | **sibling-import** | Replace with injection: pass `createRtkBuiltInTools` as a callback to `createBuiltInTools()` via `registerBundledExtensions()`. |
| `src/compact-tool-lines/getBuiltInTools.ts` | `import { getRtkRuntimeForCwd } from "@extensions/rtk"` | `@extensions/rtk` (runtime store) | **sibling-import** | Replace with injection: pass `getRtkRuntimeForCwd` as a parameter to `getBuiltInTools()` via `registerBundledExtensions()`. |
| `src/compact-tool-lines/registerCompactBuiltInTool.ts` | `import { getRtkExecutionCwd } from "@extensions/rtk"` | `@extensions/rtk` (utility) | **sibling-import** | Replace with injection: pass `getRtkExecutionCwd` as a parameter to `registerCompactBuiltInTool()` via `registerBundledExtensions()`. |

## Internal "enabled" checks (not flagged)

The following are **internal** state/configuration checks, not feature-flag system queries. They are legitimate and not redundant:

- `src/isToolGroupingEnabled.ts` — `isToolGroupingEnabled()`: internal tron toggle (returns `false`).
- `src/collapse/state.ts` — `isToolGroupCollapseEnabled()`: internal collapse state.
- `src/profiling/isTronProfilingEnabled.ts` — `isTronProfilingEnabled()`: internal profiling toggle (reads env vars).
- `src/user-message/renderCompactInputBubble.ts` — `isStartupProfileEnabled()` from `@nexus/observability`: observability profiling check, not a feature-flag.

---

## Wiring Plan

### `registerBundledExtensions()` changes

No signature change needed. The tron registration function receives `pi: ExtensionAPI`. We need to wire rtk's runtime-store functions into tron's internal modules.

#### Option A: Pass rtk functions through `registerTronExtension`

Modify the existing `registerTronExtension(pi: ExtensionAPI)` call in `createExtensionRegisterMap()` to also pass an object of rtk runtime functions:

```ts
// In createExtensionRegisterMap.ts
"rtk": registerRtkExtension,
// No change — rtk still registers independently.
```

Instead, modify tron's registration to accept a second parameter for rtk integration:

```ts
// In tron's index.ts (internal change only)
export default function registerTronExtension(
  pi: ExtensionAPI,
  rtkDeps?: {
    getRtkRuntimeForCwd?: (cwd: string) => RtkRuntime | undefined;
    createRtkBuiltInTools?: (cwd: string) => BuiltInTools;
    getRtkExecutionCwd?: (ctx?: { cwd?: string }) => string;
  },
): void {
  // ... existing code, but use rtkDeps instead of @extensions/rtk imports
}
```

In `createExtensionRegisterMap.ts`, wire rtk's exports to tron:

```ts
"tron": (pi) => registerTronExtension(pi, {
  getRtkRuntimeForCwd: getRtkRuntimeForCwd,
  createRtkBuiltInTools: createRtkBuiltInTools,
  getRtkExecutionCwd: getRtkExecutionCwd,
}),
```

This way:
- If rtk is disabled, `rtkDeps` is `undefined`, and tron falls back to base tools (which it already does when `getRtkRuntimeForCwd` returns `undefined`).
- If rtk is enabled, tron gets the functions via injection and works normally.
- The feature-flags system remains the single source of truth: if rtk is disabled, tron simply won't receive rtk's functions.

#### Files to update (conceptual, not applied):

1. `src/compact-tool-lines/createBuiltInTools.ts` — accept `rtkDeps` parameter, use `rtkDeps.getRtkRuntimeForCwd` and `rtkDeps.createRtkBuiltInTools` instead of direct imports.
2. `src/compact-tool-lines/getBuiltInTools.ts` — accept `rtkDeps` parameter, use `rtkDeps.getRtkRuntimeForCwd`.
3. `src/compact-tool-lines/registerCompactBuiltInTool.ts` — accept `rtkDeps` parameter, use `rtkDeps.getRtkExecutionCwd`.
4. `src/compact-tool-lines/registerCompactToolLinesExtension.ts` — pass `rtkDeps` to `registerCompactBuiltInTool`.
5. `src/index.ts` — pass `rtkDeps` from the registration map's wiring.
6. `packages/feature-flags/src/createExtensionRegisterMap.ts` — wire rtk's exports into tron's registration.

---

## Risk Assessment

**Current behavior if rtk is disabled:**

The static `import { getRtkRuntimeForCwd } from "@extensions/rtk"` means that when tron's module is loaded, the TypeScript bundler resolves `@extensions/rtk` to the rtk package's `index.ts`. Even if rtk's `registerRtkExtension` is never called (because rtk is disabled in feature flags), the **module code** of rtk is still bundled into tron's output.

At runtime:
- `getRtkRuntimeForCwd()` returns `undefined` (the Map is empty because rtk's `session_start` handler never ran).
- `createRtkBuiltInTools()` would still be callable (it's just a factory function), but it depends on rtk's tool implementations which expect an RTK runtime to be installed.

This means:
1. **Bundle size bloat**: rtk's code is included in tron's bundle even when rtk is disabled.
2. **Potential runtime errors**: If rtk's tools are called without RTK being installed, they may fail.
3. **Feature-flag gate bypass**: The feature-flags system gates *registration*, but not *module loading*. Tron's static imports pull in rtk's code regardless.
