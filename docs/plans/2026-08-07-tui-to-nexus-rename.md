# Plan: Rename TUI to Nexus — Clarify CLI + Interactive App Architecture

**Date:** 2026-08-07
**Status:** Draft

## Problem

The app is named and structured as "TUI" but it handles both CLI commands (version, help, sessions, themes, observations, mini-apps, install, uninstall, pi-packages) and the interactive terminal UI. The current naming is misleading:

- `apps/tui/` — the app directory (implies only TUI)
- `runCli()` — the entry point (implies CLI only, but it spawns the TUI)
- `runCliWithApp()` — the dispatcher (confusing — "CLI with app"?)
- `runApp()` — the TUI launcher (misnamed — it's the interactive session launcher)

The inversion is confusing: `runCli()` passes `runApp` as a dependency to `runCliWithApp()`, making it hard to see that `runApp()` is the TUI and `runCliWithApp()` is the dispatcher.

## Solution

Rename files and symbols to reflect actual roles. No behavioral change.

### Symbol renames

| Current | New | File |
|---|---|---|
| `runCli` | `runNexus` | `apps/tui/src/cli/runCli.ts` |
| `runCliWithApp` | `routeCommand` | `apps/tui/src/cli/runCliWithApp.ts` |
| `runApp` | `runInteractiveSession` | `apps/tui/src/runtime/runApp.ts` |
| `RunCliWithAppOptions` | `RouteCommandOptions` | `apps/tui/src/cli/runCliWithApp.ts` |

### File renames

| Current path | New path |
|---|---|
| `apps/tui/src/cli/runCli.ts` | `apps/tui/src/cli/entry.ts` |
| `apps/tui/src/cli/runCliWithApp.ts` | `apps/tui/src/cli/routeCommand.ts` |
| `apps/tui/src/runtime/runApp.ts` | `apps/tui/src/runtime/runInteractiveSession.ts` |

### Directory rename

| Current | New |
|---|---|
| `apps/tui/` | `apps/nexus/` |

## Impact analysis

### Direct callers to update

**`runNexus` (was `runCli`):**
- `apps/tui/src/index.ts:1` — `import { runCli } from "./cli/runCli.js"`

**`routeCommand` (was `runCliWithApp`):**
- `apps/tui/src/index.ts:1` — `import { runCliWithApp } from "./cli/runCliWithApp.js"`
- `apps/tui/src/cli/runCli.ts:1` — `import { runCliWithApp } from "./runCliWithApp.js"` (internal, same file after rename)

**`runInteractiveSession` (was `runApp`):**
- `apps/tui/src/index.ts:1` — `import { runApp } from "./runtime/runApp.js"`
- `apps/tui/src/cli/runCli.ts:1` — `import { runApp } from "../runtime/runApp.js"` (internal, same file after rename)
- `apps/tui/src/runtime/runApp.ts:140` — `await main(args, { extensionFactories })` (internal, same file after rename)

### Indirect callers (import chains)

- `packages/nexus-runtime/src/cli/getSourceEntrypointPath.ts:9` — references `../../../../apps/tui/src/index.ts` (path changes with directory rename)
- Any external consumers of `@nexus/app-tui` exports (check `exports` field in `apps/tui/package.json`)

### package.json updates

- `apps/tui/package.json` — `"name": "@nexus/app-tui"` → `"name": "@nexus/app-nexus"` (or keep `@nexus/app-tui` and only rename internal symbols)
- `apps/tui/package.json` — `"scripts.dev"`: `"tsx -- src/index.ts"` (unchanged, entry point file renamed)

## Migration steps

### Step 1: Symbol renames (no file moves)

1. In `apps/tui/src/cli/runCli.ts`:
   - Rename `runCli` → `runNexus`
   - Update the call to `runCliWithApp` → `routeCommand` (step 2 handles the symbol, do this after step 2)

2. In `apps/tui/src/cli/runCliWithApp.ts`:
   - Rename `runCliWithApp` → `routeCommand`
   - Rename `RunCliWithAppOptions` → `RouteCommandOptions`
   - Update the `options.runApp` usage → `options.runInteractiveSession`

3. In `apps/tui/src/runtime/runApp.ts`:
   - Rename `runApp` → `runInteractiveSession`

4. In `apps/tui/src/index.ts`:
   - Update imports: `runCli` → `runNexus`, `runCliWithApp` → `routeCommand`, `runApp` → `runInteractiveSession`
   - Update the call: `runCliWithApp(process.argv.slice(2), { runApp })` → `routeCommand(process.argv.slice(2), { runInteractiveSession })`

### Step 2: File renames

1. `apps/tui/src/cli/runCli.ts` → `apps/tui/src/cli/entry.ts`
2. `apps/tui/src/cli/runCliWithApp.ts` → `apps/tui/src/cli/routeCommand.ts`
3. `apps/tui/src/runtime/runApp.ts` → `apps/tui/src/runtime/runInteractiveSession.ts`

### Step 3: Directory rename

1. `apps/tui/` → `apps/nexus/`

### Step 4: Cross-reference updates

1. `packages/nexus-runtime/src/cli/getSourceEntrypointPath.ts:9` — update path from `../../../../apps/tui/src/index.ts` to `../../../../../apps/nexus/src/index.ts`
2. Check `apps/tui/package.json` exports field — update any path references if needed
3. Check `turbo.json` or other build configs that reference `apps/tui`
4. Check Docker/dev scripts that reference `apps/tui`

### Step 5: Verify

1. Run `just dev` in the new `apps/nexus/` directory — confirm it starts
2. Run `nexus --help` — confirm CLI still works
3. Run `nexus --version` — confirm CLI still works
4. Run the full TUI — confirm interactive mode still works

## Risk assessment

- **Low risk.** Pure rename/refactor. No behavioral change.
- No tests exist per CodeGraph (all flagged as "no covering tests found"), so no test updates needed.
- External consumers of `@nexus/app-tui` would need updating — check if any other packages import from it.

## Rollback

Since this is pure renaming, rollback is `git checkout --` on all changed files. No data or state is affected.
