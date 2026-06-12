# Plan: Always-On Zellij Manager

## Problem

The current `zellij-automation.sh` is a one-shot script: create session → start web server → generate token → open browser → authenticate → screenshot → kill everything. Every run requires managing the session, the web server, the token, and `agent-browser` from scratch. No state is preserved between runs.

## Goal

Create a TypeScript-based always-on manager CLI that:
- Manages the zellij web server port once (persistent across invocations)
- Creates, deletes, and lists sessions
- Executes commands inside sessions
- Wraps `agent-browser` for browser automation (open, snapshot, fill, click, wait, screenshot, close)
- Performs full auth flow in a single command
- Preserves state in a file so the daemon survives across CLI invocations

## Architecture

### Process model

A single TypeScript CLI (`zellij-manager.ts`) runs as a long-lived process. It is NOT backgrounded — it IS the foreground daemon. You start it once per development session.

State is persisted in `~/.config/zellij-manager/state.json`:
```json
{
  "port": 8082,
  "webServerPid": 12345,
  "activeSessions": ["nexus-dev"],
  "lastToken": "uuid-here"
}
```

### CLI surface

```
zellij-manager <subcommand> [args]

Subcommands:
  port start [port]          Start zellij web server on port (once). Refuse if already running.
  port stop                  Kill the web server process.
  port status                Show current port and PID.

  session create <name>      Create a zellij background session, set PATH.
  session delete <name>      Kill a zellij session.
  session list               List active sessions from state.

  exec <session> <cmd>       Paste a command + Enter into a zellij session.
  exec-script <session> <path>  Run a .sh script inside a session (like current ZELLIJ_COMMANDS).

  browser open <url>         Open a URL in the browser (wraps agent-browser open).
  browser snapshot           Take a page snapshot (wraps agent-browser snapshot).
  browser fill <ref> <value> Fill an input field (wraps agent-browser fill).
  browser click <ref>        Click a button (wraps agent-browser click).
  browser wait [opts]        Wait for navigation (wraps agent-browser wait).
  browser screenshot <path>  Save screenshot (wraps agent-browser screenshot).
  browser close              Close browser session (wraps agent-browser close).

  auth <session> <port>      Full auth flow: create token → extract → open browser →
                             snapshot → discover refs → fill → click → wait → screenshot → close.

  dev                        One-shot: run the full "just dev" flow (backwards compat).
```

### File structure

```
e2e_tests/zellij/
  zellij-manager.ts              # Main CLI entry — arg parsing via commander.js, subcommand routing
  zellij-manager/
    state.ts                     # Read/write state.json (port, pid, sessions, token)
    port.ts                      # Start/stop/status zellij web server (child_process)
    session.ts                   # Create/delete/list zellij sessions (child_process)
    exec.ts                      # Execute commands in sessions (zellij --session action)
    browser.ts                   # Wrap agent-browser calls (child_process.execSync)
    auth.ts                      # Full auth flow orchestration
    cli.ts                       # Arg parsing via commander.js, help text, subcommand dispatch
  zellij-automation.sh           # Existing script — refactored to delegate to manager
  scripts/
    dev_commands.sh              # Existing — unchanged
  Justfile                       # Updated to call zellij-manager dev
```

### `agent-browser` handling

`agent-browser` is NOT replaced. It is invoked via `child_process.execSync()` from the TypeScript manager. The manager:
- Constructs the correct `agent-browser <subcommand> <args>` command string
- Captures stdout/stderr
- Parses output (e.g., ref discovery from snapshot)
- Returns structured results to the caller

This removes the need for bash `grep`/`sed` pipelines to extract refs — the TS code does the parsing.

### Backwards compatibility

The existing `just dev` must continue to work. Two approaches:

1. **Shim approach** (preferred): `zellij-automation.sh` becomes a thin bash shim that calls `zellij-manager dev` via `npx tsx` or `bun run`. No behavior changes for existing callers.

2. **Migration path**: Update `Justfile` to call `zellij-manager dev` directly, then deprecate `zellij-automation.sh`.

## Implementation order

1. **state.ts** — State file read/write (port, pid, sessions, token)
2. **port.ts** — Start/stop/status zellij web server
3. **session.ts** — Create/delete/list zellij sessions
4. **exec.ts** — Execute commands in sessions
5. **browser.ts** — Wrap agent-browser (open, snapshot, fill, click, wait, screenshot, close)
6. **auth.ts** — Full auth flow (orchestrates port + session + browser)
7. **cli.ts** — Arg parsing via commander.js, help, subcommand dispatch
8. **zellij-manager.ts** — Main entry point
9. **Update zellij-automation.sh** — Delegate to manager (backwards compat)
10. **Update Justfile** — Call manager dev subcommand

## Key design constraints

- **No speculations**: All zellij CLI commands must be verified against `zellij --help` at runtime.
- **agent-browser is a dependency**: We invoke it, we don't replace it.
- **just dev must work**: The existing `just dev` workflow (create session → run commands → start web → auth → screenshot) must produce the same `zellij-authenticated.png` output.
- **State file is the source of truth**: All commands read/write `state.json`. If the process dies, the state file reflects the last known good state.
- **Error handling**: Every child_process invocation checks exit codes. Failed subcommands exit non-zero with a message to stderr.
