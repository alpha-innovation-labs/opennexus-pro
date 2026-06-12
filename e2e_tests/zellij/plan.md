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
  exec-script <session> <path>  Run a .sh script inside a session.

  dev [--session <name>] [--output <path>] [--workspace <dir>] [--commands <path>]
                             One-shot: full dev flow (migrates existing workflow).

  browser open <url>         Open a URL in the browser (wraps agent-browser open).
  browser snapshot           Take a page snapshot (wraps agent-browser snapshot).
  browser fill <ref> <value> Fill an input field (wraps agent-browser fill).
  browser click <ref>        Click a button (wraps agent-browser click).
  browser wait [opts]        Wait for navigation (wraps agent-browser wait).
  browser screenshot <path>  Save screenshot (wraps agent-browser screenshot).
// ... 86 more lines (total: 141)
## TODO — Blocking bugs preventing `just dev`

All blocking bugs have been resolved (2026-06-12):

1. ✅ **Delete `zellij-automation.sh`** — File no longer exists in the repo.
2. ✅ **Update `Justfile`** — Now calls `tsx zellij-manager.ts dev` with CLI flags (no env vars).
3. ✅ **Update `cli.ts`** — `dev` subcommand parses `--session`, `--output`, `--workspace`, `--commands` flags instead of env vars.

### Post-deletion checklist (all applied)

- [x] Remove `zellij-automation.sh` from the repo
- [x] Replace `Justfile` content with `tsx zellij-manager.ts dev`
- [ ] Verify `just dev` completes end-to-end (zellij web starts, session created, commands run, auth flow produces screenshot)
- [ ] Update any CI scripts or documentation referencing `zellij-automation.sh`

## Key design constraints

- **No speculations**: All zellij CLI commands must be verified against `zellij --help` at runtime.
- **agent-browser is a dependency**: We invoke it, we don't replace it.
- **just dev calls the TS app directly**: `Justfile` invokes `tsx zellij-manager.ts dev --session nexus-dev --output ./zellij-authenticated.png --commands ./scripts/dev_commands.sh` — CLI flags replace all `ZELLIJ_*` env vars. The workflow (create session → run commands → start web → auth → screenshot) must produce the same `zellij-authenticated.png` output.
- **State file is the source of truth**: All commands read/write `state.json`. If the process dies, the state file reflects the last known good state.
- **Error handling**: Every child_process invocation checks exit codes. Failed subcommands exit non-zero with a message to stderr.
