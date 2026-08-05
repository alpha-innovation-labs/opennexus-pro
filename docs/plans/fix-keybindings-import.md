# Fix KEYBINDINGS Import — Replace monkey-patched subpath with local reconstruction

## Problem

Multiple Nexus modules import internal subpaths from `@earendil-works/pi-coding-agent` that are not declared in the package's `exports` field. Node.js ESM throws `ERR_PACKAGE_PATH_NOT_EXPORTED`.

Previously this worked via `../../../node_modules/...` (a raw filesystem path that bypasses `exports`), but a refactor (commit `9794d55`) replaced it with a scoped import, breaking the build under Node 26.

## Root cause

The `exports` field of `@earendil-works/pi-coding-agent` only declares:
- `"."` → `./dist/index.js`
- `"./rpc-entry"` → `./dist/rpc-entry.js`

The following internal subpaths are NOT exported:
- `./dist/core/keybindings.js` (KEYBINDINGS object)
- `./dist/core/prompt-templates.js` (parseCommandArgs, substituteArgs)
- `./dist/utils/shell.js` (sanitizeBinaryOutput)
- `./dist/modes/interactive/theme/theme.js` (theme Proxy)
- `./dist/core/tools/index.js` (createAllToolDefinitions)
- `./dist/core/agent-session.js` (AgentSession — also not in exports)

`InteractiveMode` IS exported from the main entry point and can be imported safely.

## Solution

### Step 1: Create `keybindings.ts` in `packages/pi-platform/src/`

- Import `TUI_KEYBINDINGS` from `@earendil-works/pi-tui` (already a public export).
- Read the user's `keybindings.json` at module load time (from `~/.local/share/nexus/agent/keybindings.json` or `$NEXUS_CODING_AGENT_DIR/keybindings.json`).
- Add Nexus's own `app.tools.collapse` binding.
- Merge: `KEYBINDINGS = { ...TUI_KEYBINDINGS, ...userConfig, ...NEXUS_KEYBINDINGS }`.
- No hardcoded pi-coding-agent bindings — those are provided by Pi's runtime.
- Export `KEYBINDINGS` and `getUserKeybindings()` from this file.

### Step 2: Delete `applyModelKeybindingsPatch.ts`

The patch tried to disable Pi's model picker shortcuts (`ctrl+l`, `ctrl+p`, `shift+ctrl+p`) by mutating our local `KEYBINDINGS` object. This was **dead code** — Pi's `InteractiveMode` creates its own `KeybindingsManager` from its internal copy of the data, so mutating our local object had zero effect on the UI. The model selector still opens with `ctrl+l`.

Removed the file, its import, and its call from `runAppWithExtensionFactories.ts`.

### Step 3: Update `applyToolGroupCollapsePatch.ts`

- Change `KEYBINDINGS` import from `@earendil-works/pi-coding-agent/dist/core/keybindings.js` to `./keybindings.ts`.
- Change `InteractiveMode` import from `@earendil-works/pi-coding-agent/dist/modes/interactive/interactive-mode.js` to `@earendil-works/pi-coding-agent` (main entry point, already re-exports it).
- Keep existing logic (adds `app.tools.collapse` binding, patches `setupKeyHandlers`).

### Step 4: Update `applyCompactModeImagePatch.ts`

- Inline `sanitizeBinaryOutput()` function (was `dist/utils/shell.js`, not exported).

### Step 5: Update `theme.ts`

- Inline the `theme` Proxy object (was `dist/modes/interactive/theme/theme.js`, not exported).
- Re-export `initTheme`, `Theme`, and other theme utilities from the main entry point.

### Step 6: Update `createPiToolDefinitions.ts`

- Reconstruct `createAllToolDefinitions` by calling each publicly exported factory (`createReadToolDefinition`, `createBashToolDefinition`, etc.) from the main entry point.

### Step 7: Update `applyPromptTemplateArgAppendPatch.ts`

- Inline `parseCommandArgs` and `substituteArgs` functions (was `dist/core/prompt-templates.js`, not exported).
- Change dynamic import of `AgentSession` from `@earendil-works/pi-coding-agent/dist/core/agent-session.js` to `@earendil-works/pi-coding-agent` (main entry point, already re-exports it).

### Step 8: Verify

- Run `pnpm run dev` — should compile without `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- Confirm the hotkeys modal still works and `shift+ctrl+c` triggers tool group collapse.

## Files changed

| File | Change |
|---|---|
| `packages/pi-platform/src/keybindings.ts` | **New** — runtime resolver: TUI_KEYBINDINGS + user keybindings.json + Nexus additions |
| `packages/pi-platform/src/applyModelKeybindingsPatch.ts` | **Deleted** — dead code; mutating local KEYBINDINGS had no effect on Pi's runtime |
| `packages/pi-platform/src/applyToolGroupCollapsePatch.ts` | Update KEYBINDINGS import to local file; update InteractiveMode to main entry |
| `packages/pi-platform/src/applyCompactModeImagePatch.ts` | Inline `sanitizeBinaryOutput()` |
| `packages/pi-platform/src/theme.ts` | Inline `theme` Proxy; re-export theme utilities from main entry |
| `packages/pi-platform/src/tools/createPiToolDefinitions.ts` | Reconstruct from individual public factory functions |
| `packages/pi-platform/src/prompt-templates/applyPromptTemplateArgAppendPatch.ts` | Inline `parseCommandArgs` + `substituteArgs`; update AgentSession import to main entry |
| `apps/tui/src/runtime/runAppWithExtensionFactories.ts` | Remove import and call to deleted `applyModelKeybindingsPatch` |

## Notes

- `TUI_KEYBINDINGS` is publicly exported from `@earendil-works/pi-tui` via the main entry point.
- `InteractiveMode`, `AgentSession`, `Theme`, `initTheme`, and individual tool factory functions are all exported from `@earendil-works/pi-coding-agent`'s main entry point.
- User keybindings are read from `~/.local/share/nexus/agent/keybindings.json` (or `$NEXUS_CODING_AGENT_DIR/keybindings.json`) at module load time.
- The `app.tools.collapse` binding is Nexus's only custom keybinding — added on top of TUI defaults and user overrides.
- If upstream `pi-coding-agent` ever exports one of the internal subpaths, the corresponding inline function can be replaced with a simple re-export.
