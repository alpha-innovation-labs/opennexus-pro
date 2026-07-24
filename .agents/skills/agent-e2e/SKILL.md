---
name: agent-e2e
description: >-
  Create and interact with Herdr e2e test environments via CLI.
  Use when the user asks to set up a test workspace, start an agent,
  send prompts, read output, or send keys.
  Triggers on: "e2e test", "herdr setup", "start agent", "herdr agent",
  "agent-e2e", "test workspace".
---

# agent-e2e CLI

All commands are invoked via `just agent-e2e <command> [args]`.

## Commands

| Command | Usage |
|---|---|
| `setup` | `just agent-e2e setup [--label LABEL] [--agentName NAME] [--maxWait SECONDS]` — Creates workspace, waits 0.5s, starts agent. |
| `start` | `just agent-e2e start <paneId> [--maxWait SECONDS]` — Starts a new agent in a specific pane. |
| `prompt` | `just agent-e2e prompt <agentName> "<prompt>" [--timeout MS]` — Sends a text prompt and waits for response. |
| `send-keys` | `just agent-e2e send-keys <agentName> <keys...>` — Sends keypresses (Enter, Esc, Ctrl+c, etc.). |
| `read` | `just agent-e2e read <agentName> [--lines N]` — Reads agent terminal output (default: last 50 lines). |
| `close` | `just agent-e2e close <workspaceId>` — Closes workspace and cleans up. |
| `full` | `just agent-e2e full [--label LABEL] [--agentName NAME] [--prompt TEXT] [--timeout MS]` — Setup + start + prompt in one shot. |
| `help` | `just agent-e2e help` — Shows usage. |

## Typical workflow

```bash
# 1. Create workspace with a known agent name
just agent-e2e setup --label my-test --agentName test-agent

# 2. Prompt the agent (use for file writes, tasks, instructions)
just agent-e2e prompt test-agent "write a test file at tests/example.test.ts that checks..."

# 3. Read agent terminal output
just agent-e2e read test-agent --lines 100

# 4. Send keypresses (Enter, Esc, Ctrl+c, etc.)
just agent-e2e send-keys test-agent Enter

# 5. Clean up when done
just agent-e2e close w42
```

## Rules

- **Use `prompt` to write content.** It sends text instructions to the agent. `send-keys` only sends keypresses (Enter, Esc, Ctrl+c).
- **Use `--agentName`** in `setup` when you need a predictable agent name across commands.
- **Use `read`** to inspect what the agent is doing or its output.
- **Always `close`** when done to clean up resources.
- If agent start fails with "not an available shell", you are not inside a real Herdr session — this is expected when running outside `HERDR_ENV=1`.

## Critical gotchas for e2e test creation

- **`send-keys` interacts with the TUI; `prompt` does not.** `send-keys` sends actual keystrokes into the agent's terminal pane (e.g., `Slash l o g i n Enter` types `/login`). `prompt` sends text instructions to the agent to *report* what it observes. They are not interchangeable — using `prompt` to type TUI commands will fail.
- **The agent cannot self-interact with the TUI.** The agent-e2e agent is a terminal session, not a UI actor. A human (or test harness) must send keypresses via `send-keys`. The agent only reports back what it sees via `prompt` + `read`.
- **`read` captures raw terminal ASCII art, not structured data.** The snapshot contains box-drawing characters (`│`, `─`, `╭`, `╰`), promptline text, modal headers, and body text. Assertions must grep for expected strings within this raw output — there is no schema to parse.
- **Color states are represented by visual markers, not ANSI codes.** The TUI uses symbols like `●` (green/enabled) vs plain text (gray/disabled). Snapshots are text-only — rely on these markers, not color escape sequences.
- **Run e2e tests *after* the feature is implemented.** Before implementation, the snapshot shows the broken state (e.g., wrong pane titles, empty models). Test snapshots define the *target* state — the expected post-implementation output. Before-implementation runs are for exploration only.
- **Always save snapshots to named files.** Use `> snapshots/<test-name>.jsonl` to persist `read` output. These files are the verifiable artifacts — the test passes if the snapshot content matches the assertions.
- **Always `close` the workspace after tests.** Resources accumulate otherwise. Use `just agent-e2e close <workspaceId>` when done.
