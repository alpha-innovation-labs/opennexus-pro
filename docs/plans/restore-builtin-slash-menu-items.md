# Restore Builtin Slash Menu Items — Chat, Workspace, and System Sections

## Problem

The slash menu (`/`) is missing three sections that were previously visible:

- **Chat** — `new`, `clone`, `compact`, `copy`, `fork`, `name`, `resume`, `session`, `share`, `tree`
- **Workspace** — `export`, `import`
- **System** — `changelog`, `trust`, `quit`

The menu now only shows: Resources, Custom Commands, Auth (thinking), Configuration (settings), and Extensions.

## Root Cause

The slash menu item generation pipeline is:

```
createTopLevelItems()
  → createCommandLeaves(dynamicCommands)
    → [...readBuiltinSlashCommands(), ...getRegisteredSlashCommands(), ...extensionCommands]
```

`readBuiltinSlashCommands()` returns `[]` because Pi's `BUILTIN_SLASH_COMMANDS` constant is **no longer exported** from the public API of `@earendil-works/pi-coding-agent`. The package's `exports` field only declares `"."` and `"./rpc-entry"` — there is no subpath export for `slash-commands`.

The built-in Pi commands live in `BUILTIN_SLASH_COMMANDS` (exported from `dist/core/slash-commands.js`) but are inaccessible via the public API. A recent Pi update removed the re-export, and Nexus's `readBuiltinSlashCommands()` was never updated to handle this.

Meanwhile:
- `getRegisteredSlashCommands()` returns only extension-registered commands (e.g., `git-commit`, `project-grill-me`, `social-share`)
- `extensionCommands` (from `filterVisibleRuntimeSlashCommands`) only includes commands with `source === "extension"`

Since `readBuiltinSlashCommands()` returns empty, the Chat/Workspace/System sections have zero items and don't render.

## Data: Built-in Pi Commands

Pi's `BUILTIN_SLASH_COMMANDS` (from `@earendil-works/pi-coding-agent/dist/core/slash-commands.js`) contains:

```js
[
  { name: "settings", description: "Open settings menu" },
  { name: "model", description: "Select model (opens selector UI)", argumentHint: "<provider/model>" },
  { name: "scoped-models", description: "Enable/disable models for Ctrl+P cycling" },
  { name: "export", description: "Export session (HTML default, or specify path: .html/.jsonl)" },
  { name: "import", description: "Import and resume a session from a JSONL file" },
  { name: "share", description: "Share session as a secret GitHub gist" },
  { name: "copy", description: "Copy last agent message to clipboard" },
  { name: "name", description: "Set session display name" },
  { name: "session", description: "Show session info and stats" },
  { name: "changelog", description: "Show changelog entries" },
  { name: "hotkeys", description: "Show all keyboard shortcuts" },
  { name: "fork", description: "Create a new fork from a previous user message" },
  { name: "clone", description: "Duplicate the current session at the current position" },
  { name: "tree", description: "Navigate session tree (switch branches)" },
  { name: "trust", description: "Save project trust decision for future sessions" },
  { name: "login", description: "Configure provider authentication", argumentHint: "<provider>" },
  { name: "logout", description: "Remove provider authentication" },
  { name: "new", description: "Start a new session" },
  { name: "compact", description: "Manually compact the session context" },
  { name: "resume", description: "Resume a different session" },
  { name: "reload", description: "Reload keybindings, extensions, skills, prompts, themes, and context files" },
  { name: "quit", description: "Quit pi" },
]
```

## Group Mapping

`getSlashCommandMenuGroup()` in `packages/extension-core/src/slash-menu/getSlashCommandMenuGroup.ts` maps command names to menu groups via `BUILTIN_MENU_GROUPS`:

| Group | Commands |
|-------|----------|
| Chat | clone, compact, copy, fork, name, new, resume, session, share, tree |
| Auth | login, logout, model |
| Configuration | scoped-models, hotkeys, reload, settings |
| System | changelog, quit, trust |
| Workspace | export, import |

## Files to Modify

### 1. `packages/extension-core/src/slash-menu/readBuiltinSlashCommands.ts`

**Current state:** Returns `[]` with a comment saying `BUILTIN_SLASH_COMMANDS` is not accessible.

**Required change:** Import `BUILTIN_SLASH_COMMANDS` from the Pi package and convert each entry to a `RegisteredSlashCommand` object with `source: "builtin"`.

Since the symbol is not exported from the package's `exports` field, we have two options:

**Option A (preferred):** Use a direct filesystem path import to the compiled JS:
```ts
import { BUILTIN_SLASH_COMMANDS } from "@earendil-works/pi-coding-agent/dist/core/slash-commands.js";
```
This mirrors the pattern already used elsewhere in Nexus (see `fix-keybindings-import.md` for precedent). The downside: it bypasses the package's `exports` field, which Node.js ESM normally blocks. However, Nexus already uses this pattern for other internal imports.

**Option B:** Hardcode the command list derived from Pi's `BUILTIN_SLASH_COMMANDS` directly in `readBuiltinSlashCommands()`. This is fragile — it requires updates every time Pi adds or renames a builtin command.

### 2. No changes needed to other files

- `createCommandLeaves()` already spreads `readBuiltinSlashCommands()` into the commands array
- `getSlashCommandMenuGroup()` already maps builtin command names to groups via `BUILTIN_MENU_GROUPS`
- `groupAndSortTopLevelItems()` already sorts groups by rank (Chat=2, Auth=3, Configuration=4, Workspace=5, System=6)
- `handleTopLevelMenuEnter()` already handles the values (`new`, `clone`, `compact`, `export`, `import`, `trust`, `login`, `logout`, `model`, `session`, `share`, `tree`, `fork`, `resume`, `changelog`, `hotkeys`, `reload`, `quit`)

## Implementation Steps

1. **Update `readBuiltinSlashCommands.ts`** to import `BUILTIN_SLASH_COMMANDS` from `@earendil-works/pi-coding-agent/dist/core/slash-commands.js` and map each entry to a `RegisteredSlashCommand` with `source: "builtin"`.

2. **Verify the import path works** under the project's build system (bun/vite/esbuild bundling). If the direct path import is blocked by Node.js ESM exports, fall back to hardcoding the command list.

3. **Verify the Chat, Workspace, and System sections appear** in the slash menu by opening `/` and confirming:
   - Chat section contains: `new`, `clone`, `compact`, `copy`, `fork`, `name`, `resume`, `session`, `share`, `tree`
   - Workspace section contains: `export`, `import`
   - System section contains: `changelog`, `trust`, `quit`

4. **Verify existing functionality** is unchanged — Auth, Configuration, Extensions, Resources, and Custom Commands sections should continue to work as before.

## Risk Assessment

- **Low risk** — only one file needs changes (`readBuiltinSlashCommands.ts`). All downstream consumers (`createCommandLeaves`, `getSlashCommandMenuGroup`, `handleTopLevelMenuEnter`, `groupAndSortTopLevelItems`) already handle `source: "builtin"` commands correctly.
- **Medium risk** — if the direct import path is blocked by Node.js ESM, we must hardcode the list. This requires a CI check to catch drift when Pi updates its builtin commands.
- **Mitigation:** If hardcoding, add a comment with the Pi source file path and version for easy reference when Pi updates.

## Files

| File | Change |
|------|--------|
| `packages/extension-core/src/slash-menu/readBuiltinSlashCommands.ts` | Import and map `BUILTIN_SLASH_COMMANDS` |
