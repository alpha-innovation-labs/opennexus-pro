# Audit: notify

## Summary

The notify extension is **clean** — it contains **zero** redundant feature-flag enable checks.

All imports within `packages/extension-core/notify/src/` are either:
- Internal module imports (relative `./runtime/...` paths) within the notify extension itself.
- Node.js built-in modules (`node:child_process`).
- A single type-only import from `@earendil-works/pi-coding-agent` (`ExtensionAPI` type).

There are **no** imports from `@nexus/feature-flags`, **no** calls to `isRuntimeExtensionFeatureEnabled()`, `getEnabledExtensionFeatureFlags()`, `getRegisteredToolRecords()`, `getAllBundledExtensionIds()`, or `isBundledExtension()`.

There are **no** cross-extension runtime imports from sibling extensions (no `@extensions/*` or `@nexus/*` runtime packages imported).

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| *(none)* | *(no redundant checks found)* | — | — | — |

## Detailed analysis

### `registerNotifyExtension.ts`

The registration function contains **no** enablement check. Its JSDoc comment (lines 5–9) explicitly states:

> In the new system, notify is enabled by default in the hardcoded registry. Users can disable it via config.json under `featureFlags.notify.enabled = false`. The registration function itself does not check `notifyEnabled` — that's handled by the feature-flag system.

The function simply registers an `agent_end` listener that calls `sendNotifyMessage()`. No feature-flags import.

### `runtime/sendNotifyMessage.ts`

Imports and uses internal notify runtime modules (`getNotifySoundCommand`, `notifyWithOsc9`, `notifyWithOsc99`, `notifyWithOsc777`, `notifyWithWindowsToast`, `runNotifySound`). All are within the same extension — **not** cross-extension imports. No feature-flags queries.

### All other runtime files

- `buildWindowsToastScript.ts` — Pure function, no imports.
- `getNotifySoundCommand.ts` — Pure function, reads `process.env` and `process.platform` only.
- `notifyWithOsc777.ts` / `notifyWithOsc9.ts` / `notifyWithOsc99.ts` — Pure functions, import only `./wrapForTmux`.
- `notifyWithWindowsToast.ts` — Pure function, imports only `node:child_process` and `./buildWindowsToastScript`.
- `runNotifySound.ts` — Pure function, imports only `node:child_process`.
- `wrapForTmux.ts` — Pure function, reads `process.env.TMUX` only.
- `index.ts` — Re-exports only.

### Feature-flags system integration

The `createExtensionRegisterMap()` in `packages/feature-flags/src/createExtensionRegisterMap.ts` imports `registerNotifyExtension` from `@extensions/notify` and maps it under the key `"notify"`. The `registry.ts` entry for notify defaults to `{ enabled: true, features: ["desktop-notifications"] }`.

The notify extension itself does **not** query the feature-flags system at runtime — it trusts the loading gate. This is the correct pattern.

### Package dependencies

`packages/extension-core/notify/package.json` lists only these dependencies:
- `@earendil-works/pi-coding-agent` (type import only)
- `@nexus/runtime` (workspace dependency)

There is **no** dependency on `@nexus/feature-flags`.

## Wiring Plan

**No wiring changes needed.** The notify extension is already correctly structured:

1. It has no internal enablement checks.
2. It has no cross-extension runtime imports.
3. It has no dependency on `@nexus/feature-flags`.
4. `registerBundledExtensions()` / `createExtensionRegisterMap()` already wires `registerNotifyExtension` correctly.

The notify extension is a model example of the desired pattern: register its behavior, trust the feature-flag system to gate loading, and do not query feature flags at runtime.
