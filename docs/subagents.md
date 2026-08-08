# Subagent CLI

Manage subagent panes from the terminal.

## Commands

| Command | Description |
|---------|-------------|
| `just dev subagent start` | Split current pane right and launch nexus in the new pane |
| `just dev subagent send <pane-id> "<text>"` | Send text to a pane (followed by Enter) |
| `just dev subagent send-keys <pane-id> <keys...>` | Send key presses (e.g. Enter, Esc) |
| `just dev subagent read <pane-id>` | Read pane terminal output |
| `just dev subagent help` | Show help |

## How it works

`nexus subagent` is a CLI subcommand wired into `apps/tui/src/cli/runCliWithApp.ts`. It dispatches to handler functions in `apps/tui/src/cli/subagent/`.

### `start`

1. Calls `herdr pane split --current --direction right` to split the current pane.
2. The split command returns JSON with the new pane's `pane_id` — extracted directly from the output.
3. Calls `herdr pane run <pane-id> nexus` to launch the interactive TUI in the new pane.

### `send`

1. Calls `herdr pane send-text <pane-id> "<text>"` to type text into the pane.
2. Calls `herdr pane send-keys <pane-id> Enter` to submit.

### `send-keys`

Calls `herdr pane send-keys <pane-id> <key>...` to send key presses (Enter, Esc, Ctrl+c, etc.).

### `read`

Calls `herdr pane read <pane-id>` to read the pane's terminal output. Supports `--lines N` and `--source visible|recent`.


