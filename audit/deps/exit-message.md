# Audit: exit-message

## Summary

The `exit-message` extension is a clean, self-contained module with **no redundant feature-flag
enable checks**. It does not import from `@nexus/feature-flags`, does not call any enablement
gating functions, and does not statically import sibling extension runtime classes or functions.

All 11 source files were reviewed:

| File | Purpose |
|------|---------|
| `src/index.ts` | Barrel re-exports |
| `src/registerExitMessageExtension.ts` | Extension registration (entrypoint called by feature-flags) |
| `src/formatExitMessage.ts` | Formats the session title + resume command |
| `src/formatPurpleBox.ts` | Purple terminal box rendering |
| `src/hasRealSessionMessages.ts` | Checks session manager for persisted messages |
| `src/styleExitCommand.ts` | Terminal styling helpers (bold, purple, border) |
| `src/updateExitMessageFromSessionTitle.ts` | Writes session title to exit message state |
| `src/state/exitMessageState.ts` | Shared in-memory state object |
| `src/state/getExitMessage.ts` | Reads exit message from state |
| `src/state/setExitMessage.ts` | Writes exit message to state |
| `src/state/clearExitMessage.ts` | Clears exit message from state |

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| *(none)* | — | — | — | — |

**No findings.** The extension contains zero occurrences of:

- `isRuntimeExtensionFeatureEnabled()` or similar enablement gates
- `getEnabledExtensionFeatureFlags()`, `getRegisteredToolRecords()`, or `getAllBundledExtensionIds()`
- Static imports of sibling extension runtime modules (`@extensions/<name>`)
- Any conditional logic based on whether itself or a sibling extension is enabled

## Internal Dependencies

The extension does have internal cross-module imports (all within the same extension), which are
expected and correct:

| Importing File | Imported From | Type |
|---------------|---------------|------|
| `registerExitMessageExtension.ts` | `hasRealSessionMessages` | runtime — local to extension |
| `registerExitMessageExtension.ts` | `clearExitMessage` | runtime — local to extension |
| `registerExitMessageExtension.ts` | `updateExitMessageFromSessionTitle` | runtime — local to extension |
| `updateExitMessageFromSessionTitle.ts` | `formatExitMessage` | runtime — local to extension |
| `updateExitMessageFromSessionTitle.ts` | `setExitMessage` | runtime — local to extension |
| `formatExitMessage.ts` | `formatPurpleBox` | runtime — local to extension |
| `formatExitMessage.ts` | `styleExitCommand` | runtime — local to extension |
| `formatPurpleBox.ts` | `styleExitBorder` | runtime — local to extension |
| `state/getExitMessage.ts` | `exitMessageState` | runtime — local to extension |
| `state/setExitMessage.ts` | `exitMessageState` | runtime — local to extension |
| `state/clearExitMessage.ts` | `exitMessageState` | runtime — local to extension |

All of these are intra-extension imports and are **not** cross-extension dependencies.

## Wiring Plan

No wiring changes needed. The extension's `registerExitMessageExtension` is already correctly
registered in `createExtensionRegisterMap()` and `registry.ts` under the `"exit-message"` flag,
and the feature-flags system gates its loading via `createExtensionRegistrationTask()` — which
calls `flag.register(pi)` for each enabled extension.

The extension does not need any injection points because it has no cross-extension runtime
dependencies to resolve.

## Conclusion

**The `exit-message` extension is audit-clean.** It contains no redundant feature-flag enable
checks, no sibling extension imports, and no compile-time cross-extension dependencies. No
changes are required.
