# Plan: User commands directory — `~/.config/nexus/commands/*.md`

## Background & investigation

### How bundled commands are registered today

Nexus registers bundled slash commands through **three layers**:

1. **Source file** — `packages/assets/src/commands/git-commit.md` (and other `.md` files in that directory). Each file has YAML frontmatter (`description: "..."`) and a markdown body that becomes the system prompt.

2. **Path resolution** — `packages/assets/src/commands/getBundledCommandsPath.ts` exports `getBundledCommandsPath()`, which resolves the absolute path to the commands directory via `resolveBundledAssetPath(import.meta.url, "commands", "./")`.

3. **CLI injection** — `apps/tui/src/cli/createAppArgs.ts` calls `getBundledCommandsPath()` and prepends `--prompt-template <bundledPath>` to the argument list passed to Pi.

4. **Pi CLI parser** — `node_modules/@earendil-works/pi-coding-agent/dist/cli/args.js` (line 131): each `--prompt-template <path>` invocation pushes the path into `result.promptTemplates` array. The flag can be specified multiple times.

5. **Pi prompt-templates.js** — `loadPromptTemplates()` iterates `result.promptTemplates`, scans each directory for `.md` files (line 136), and for each file:
   - Filename (minus `.md`) becomes the **slash command name** (e.g. `git-commit`)
   - Frontmatter `description` becomes the **slash menu description**
   - Markdown body becomes the **system prompt**

6. **Template expansion** — When the user types `/git-commit ...`, Pi's `expandPromptTemplate()` (line 223) matches the name, parses any arguments, substitutes them into the prompt body, and feeds the result to the agent.

### Where user commands should live

Nexus already has a user config directory abstraction:

- `packages/nexus-runtime/src/config/getUserConfigDirPath.ts` resolves `~/.config/nexus` (overridable via `NEXUS_CONFIG_DIR` env var).
- This is the canonical location for all user-facing Nexus configuration.

User commands should live at:

```
~/.config/nexus/commands/*.md
```

This mirrors the bundled commands layout: one `.md` file per command, named after the slash command.

### What changes are needed

Three files need modification. No new files are required beyond the plan itself.

---

### Change 1 — Add `getUserCommandsPath()` to `@nexus/runtime`

**File**: `packages/nexus-runtime/src/config/getUserCommandsPath.ts` (new)

```ts
import { join } from "node:path";
import { getUserConfigDirPath } from "./getUserConfigDirPath.js";

/**
 * Resolves the user commands directory path.
 *
 * @returns Absolute path to `~/.config/nexus/commands`.
 */
export function getUserCommandsPath(): string {
  return join(getUserConfigDirPath(), "commands");
}
```

This follows the same pattern as `getBundledCommandsPath()` and `getBundledThemesPath()` — a single exported function that returns a resolved path, derived from the user config directory.

---

### Change 2 — Inject user commands path in `createAppArgs`

**File**: `apps/tui/src/cli/createAppArgs.ts`

Current flow (lines 14-31):

```ts
const bundledCommandsPath = getBundledCommandsPath();
// ...
if (!hasBundledCommandsPath) prependedArgs.push("--prompt-template", bundledCommandsPath);
```

Modified flow:

```ts
import { getUserCommandsPath } from "@nexus/runtime/config/getUserCommandsPath.js";

const bundledCommandsPath = getBundledCommandsPath();
const userCommandsPath = getUserCommandsPath();
// ...
if (!hasBundledCommandsPath) prependedArgs.push("--prompt-template", bundledCommandsPath);
if (userCommandsExists(userCommandsPath)) {
  prependedArgs.push("--prompt-template", userCommandsPath);
}
```

Key details:

- The user commands path is **appended** after the bundled path. Pi processes prompt templates in the order they appear on the command line, so user commands take priority during template name resolution (later entries override earlier ones when `loadPromptTemplates` finds duplicate names — actually, Pi loads all templates into a single array and `expandPromptTemplate` uses `.find()`, which returns the **first** match. So bundled commands would take priority over user commands with the same name. **We need to decide the override direction.** If user commands should override bundled ones, we must either reverse the order or let user commands be listed first. **Recommendation: list user commands first, then bundled.** This way user commands shadow bundled commands by name, matching the expected "user overrides defaults" mental model.

- The user commands directory may not exist (new Nexus install). We must check existence before injecting the flag. Use `existsSync(userCommandsPath)` from `node:fs`.

---

### Change 3 — Update help text

**File**: `apps/tui/src/cli/help/createNexusUsageText.ts`

The help text already documents `--prompt-template <path>` (line 41: `"  --prompt-template <path>           Load extra prompt templates"`). No change needed — the flag already exists in Pi's CLI.

---

## Test plan

### E2E test: user command registered and expanded

**File**: `test/app/userCommandsE2E.test.ts` (new)

**Approach** — Use the existing virtual-terminal test harness pattern (see `test/extensions/neo-editor/slashCommandSubmit.test.ts`):

1. Create a temporary directory under `tmpdir()` that mimics `~/.config/nexus/commands/`.
2. Write a `ping.md` file:

```md
---
description: Pick a random number between 1 and 10
---

# Nexus Ping

When the user types `/ping` with optional arguments:
1. Parse any numeric arguments (default: 1 to 10).
2. Pick a random number in that range.
3. Reply with just the number, nothing else.

Example user input: `/ping`
Expected output: A single number between 1 and 10.

Example user input: `/ping 1 100`
Expected output: A single number between 1 and 100.
```

3. Call `createAppArgs([])` with the temp directory set via `NEXUS_CONFIG_DIR`.
4. Verify the returned args contain **two** `--prompt-template` flags: one for the user commands dir, one for the bundled dir.
5. Verify the user commands path appears **before** the bundled path in the args array (so user commands shadow bundled ones).

### E2E test: command executes end-to-end via `just dev`

**File**: `e2e_tests/scripts/test_user_commands.sh` (new, or integrated into existing e2e harness)

**Steps**:

1. Create `~/.config/nexus/commands/ping.md` with the content above.
2. Run: `just dev -p '/ping'`
3. Capture the output — it should contain a single integer between 1 and 10.
4. Verify the output is a number in range [1, 10].
5. Clean up: remove the `ping.md` file.

This verifies the full chain: file on disk → CLI injection → Pi parsing → template expansion → agent execution.

### Negative test: non-existent user commands directory

1. Ensure `~/.config/nexus/commands/` does not exist (or is empty).
2. Call `createAppArgs([])`.
3. Verify the args contain exactly **one** `--prompt-template` flag (bundled only).
4. Verify no error is thrown — the app starts normally without user commands.

### Negative test: user command shadows bundled command

1. Place a `git-commit.md` in `~/.config/nexus/commands/` with a different description.
2. Call `createAppArgs([])`.
3. Verify both `--prompt-template` flags are present.
4. When the slash modal is opened and the user types `/git-commit`, the **user's** version should be used (first match in the prompt templates array).

---

## Files affected

| File | Change |
|------|--------|
| `packages/nexus-runtime/src/config/getUserCommandsPath.ts` | **New** — resolve `~/.config/nexus/commands` |
| `apps/tui/src/cli/createAppArgs.ts` | Import `getUserCommandsPath`, inject user `--prompt-template` after bundled, guard with `existsSync` |
| `test/app/createAppArgs.test.ts` | Add tests: user commands path injected, user commands listed before bundled, no flag when dir missing |
| `test/app/userCommandsE2E.test.ts` | **New** — full e2e test with temp `ping.md` |
| `e2e_tests/scripts/test_user_commands.sh` | **New** — `just dev -p '/ping'` integration test |

## Risks & considerations

- **Directory creation**: The user commands directory must **not** be created automatically. If it doesn't exist, Nexus simply doesn't inject the flag. The user creates it themselves.
- **Extension `.md` files**: User `.md` files in `~/.config/nexus/commands/` follow the same format as bundled ones — frontmatter + body. No new parsing logic is needed.
- **`--no-prompt-templates` flag**: If the user passes `--no-prompt-templates` or `-np`, Pi disables all prompt template loading entirely. `createAppArgs` should respect this and skip injecting the user commands path too. (Current code already checks `hasBundledCommandsPath` but doesn't check for `--no-prompt-templates`. This is a pre-existing gap that this change should also address.)
- **Symlinks**: Pi's `loadTemplatesFromDir()` follows symlinks to files. Users could symlink files into their commands directory if they want to share commands across machines.
