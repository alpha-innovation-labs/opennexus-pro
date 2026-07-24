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
