# Audit: observations

## Summary

The observations extension is **clean** of redundant feature-flag enable checks. It does not call any
of the following functions from `@nexus/feature-flags`:

- `isRuntimeExtensionFeatureEnabled()`
- `getEnabledExtensionFeatureFlags()`
- `getRegisteredToolRecords()`
- `getAllBundledExtensionIds()`

The extension's own enablement is entirely handled by the feature-flags system at load time — there
are no internal `isRuntimeExtensionFeatureEnabled("observations")` gates, no sibling enablement
checks, and no conditional loading based on feature-flag state.

## Findings

| # | File | What it checks/imports | From where | Classification | Suggested fix |
|---|------|----------------------|------------|----------------|---------------|
| 1 | `src/command/openObservationPromptExternalEditor.ts:2` | `import { openSystemPromptExternalEditor } from "@extensions/prompts"` | `@extensions/prompts` (sibling extension) | **sibling-import** | Replace with injection via `registerBundledExtensions()` |
| 2 | `src/command/registerObservationsCommand.ts:2` | `import { withSlashMenuGroup } from "@extensions/slash-menu"` | `@extensions/slash-menu` (sibling extension) | **sibling-import** | Replace with injection via `registerBundledExtensions()` |
| 3 | `src/command/isObservationPromptEditingEnabled.ts:7` | `return !process.env.PI_PACKAGE_DIR;` | Local environment variable | **legitimate** | No change needed — this gates a dev-only feature (prompt editing), not feature-flag enablement |

### Notes on each finding

#### Finding 1: `@extensions/prompts` import

**File:** `src/command/openObservationPromptExternalEditor.ts`

This imports a **runtime** function (not a type-only import) from the `prompts` extension. The
function `openSystemPromptExternalEditor` is called at runtime on line 15:

```ts
import { openSystemPromptExternalEditor } from "@extensions/prompts";
// ...
return openSystemPromptExternalEditor(tui, prompt);
```

Since the feature-flags system gates whether `prompts` loads at all, this static import creates a
compile-time cross-extension dependency. If `prompts` is disabled, the observations extension would
still compile against it but fail at runtime.

**Fix:** Inject the function reference through `registerBundledExtensions()` (e.g., as a callback
property on the config object passed to `registerObservationsExtension`).

#### Finding 2: `@extensions/slash-menu` import

**File:** `src/command/registerObservationsCommand.ts`

This imports a **runtime** function from the `slash-menu` extension. The function `withSlashMenuGroup`
is used at line 15 to wrap the observations command definition:

```ts
import { withSlashMenuGroup } from "@extensions/slash-menu";
// ...
withSlashMenuGroup(
  {
    description: "Show observations for the current conversation",
    handler: async (_args: string, ctx: ExtensionCommandContext) => {
      await showObservationsModal(ctx);
    },
  },
  "Extensions",
),
```

Since the feature-flags system gates whether `slash-menu` loads, this static import creates a
compile-time cross-extension dependency.

**Fix:** Inject the function reference through `registerBundledExtensions()`. The `slash-menu`
extension could be made optional — if it's not loaded, the command registers without slash-menu
grouping.

#### Finding 3: `PI_PACKAGE_DIR` check (legitimate)

**File:** `src/command/isObservationPromptEditingEnabled.ts`

This checks `!process.env.PI_PACKAGE_DIR` to determine whether observation prompt editing is
exposed. This is a **dev-vs-release** check (source builds expose the feature; packaged releases
hide it), not a feature-flag enable check. It does not reference `@nexus/feature-flags` and does
not gate on any extension's enablement.

**No fix needed.**

### Platform imports (not flagged)

The following imports are from platform-level packages (not sibling extensions) and are correctly
used at runtime:

| Import | Package | Files |
|--------|---------|-------|
| `@nexus/tui-kit` | Platform TUI kit | `ObservationsModal.ts`, `showObservationsModal.ts` |
| `@nexus/observability` | Platform observability | `registerObservationsCommand.ts`, `registerObservationTracker.ts` |
| `@nexus/runtime` | Platform runtime | `runObservationRecreateCliCommand.ts`, `runObservationSummarizer.ts` |

These are platform dependencies, not sibling extensions, and are not subject to the feature-flag
gating concern.

## Wiring Plan

### Injection points needed in `registerBundledExtensions()`

1. **`prompts` extension injection** — `registerObservationsExtension()` should accept an optional
   `openSystemPromptExternalEditor?: (tui: TUI, prompt: string) => string | undefined` callback.
   When `prompts` is enabled, `registerBundledExtensions()` passes it; when disabled, observations
   should either skip the edit feature gracefully or provide a no-op fallback.

2. **`slash-menu` extension injection** — `registerObservationsExtension()` should accept an
   optional `withSlashMenuGroup?: <T extends object>(cmd: T, group: string) => T` callback.
   When `slash-menu` is enabled, `registerBundledExtensions()` passes it; when disabled, the
   observations command registers without slash-menu grouping (still functional, just without
   slash-menu organization).

### Updated `registerObservationsExtension` signature (internal only — no external API change)

```ts
export function registerObservationsExtension(
  pi: ExtensionAPI,
  deps?: {
    openSystemPromptExternalEditor?: typeof openSystemPromptExternalEditor;
    withSlashMenuGroup?: typeof withSlashMenuGroup;
  },
): void {
  registerObservationTracker(pi);
  registerObservationsCommand(pi, deps);
}
```

### Files requiring updates

| File | Change |
|------|--------|
| `src/command/openObservationPromptExternalEditor.ts` | Remove `@extensions/prompts` import; accept callback via parameter or module-level dependency. |
| `src/command/registerObservationsCommand.ts` | Remove `@extensions/slash-menu` import; accept `withSlashMenuGroup` as optional parameter. |
| `src/registerObservationsExtension.ts` | Pass injected dependencies through to child registrations. |
| `packages/extension-core/runtime/src/registerBundledExtensions.ts` | Wire `prompts` and `slash-menu` runtime exports into observations when they are enabled. |
