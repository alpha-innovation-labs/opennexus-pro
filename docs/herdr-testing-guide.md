# Herdr Testing Guide

How to use Herdr for testing Nexus agents, from CLI commands to e2e test suites.

---

## Quick Reference

```bash
# Create a workspace + start an agent in one shot
just agent-e2e setup --label my-test --agentName my-agent

# Start an agent in a specific pane
just agent-e2e start w72:p1 --agentName my-agent

# Prompt an agent and wait for response
just agent-e2e prompt my-agent "what's the weather?"

# Read agent terminal output (last 50 lines)
just agent-e2e read my-agent --lines 100

# Send key presses to an agent
just agent-e2e send-keys my-agent Enter

# Close a workspace (cleanup)
just agent-e2e close w72
```

---

## The Full Lifecycle

```
setup  →  start  →  prompt  →  read  →  close
```

### 1. Setup — create workspace + start agent

```bash
just agent-e2e setup --label hello-world --agentName hello
```

This:
- Creates a workspace with label `hello-world`
- Waits 0.5s for the root pane to become available
- Starts a `mastracode` agent named `hello` in the root pane
- Returns workspace ID (e.g. `w42`) and pane ID (e.g. `w42:p1`)

### 2. Prompt — send a prompt and wait for response

```bash
just agent-e2e prompt hello "tell me a joke"
```

This:
- Sends the prompt text to the agent
- Waits for the agent to settle (idle/done/blocked)
- Prints the agent's terminal output

### 3. Read — inspect agent terminal output

```bash
just agent-e2e read hello --lines 100
```

Reads the last 100 lines of the agent's terminal output.

### 4. Send keys — simulate user input

```bash
just agent-e2e send-keys hello Enter
just agent-e2e send-keys hello "n" Enter
```

Key presses are space-separated: `Enter`, `Esc`, `Ctrl+c`, `a b c`.

### 5. Close — cleanup

```bash
just agent-e2e close w42
```

Closes the workspace and all its panes/agents.

---

## One-Liner: Full Lifecycle

```bash
just agent-e2e full --label my-test --prompt "hello world"
```

Runs setup → prompt → print summary in one command.

---

## Writing e2e Tests

Tests live in `test/` and use Vitest. Import from `@nexus/herdr`:

```typescript
import {
  prepareHerdr,
  startHerdrAgent,
  promptHerdrAgent,
  closeHerdrWorkspace,
} from "@nexus/herdr";
```

### `prepareHerdr()` — the entry point

Creates a workspace, waits for the root pane, and starts a `mastracode` agent:

```typescript
const { workspaceId, rootPaneId, agentName } = prepareHerdr({
  workspaceLabel: "my-test",
  maxWaitSeconds: 60,
  agentName: "my-agent",
});
```

Returns:
- `workspaceId` — e.g. `"w42"`
- `rootPaneId` — e.g. `"w42:p1"`
- `agentName` — e.g. `"my-agent"`

If the agent kind doesn't match (e.g. Herdr detects `omp` instead of `mastracode`), this throws a `FATAL: Agent start failed` error.

### `startHerdrAgent(paneId)` — start in an existing pane

```typescript
const agentName = startHerdrAgent("w42:p2", { maxWaitSeconds: 60 });
```

Starts a `mastracode` agent in the given pane. Generates a random agent name.

### `promptHerdrAgent(agentName, text)` — send and wait

```typescript
const result = promptHerdrAgent("my-agent", "compute 2+2");
```

Sends a prompt and waits for the agent to settle. Returns the agent state.

### `closeHerdrWorkspace(workspaceId)` — cleanup

```typescript
closeHerdrWorkspace("w42");
```

Closes the workspace. Silently ignores if already closed.

---

## Example Test

```typescript
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import {
  prepareHerdr,
  promptHerdrAgent,
  closeHerdrWorkspace,
} from "@nexus/herdr";

let workspaceId: string;
let agentName: string;

beforeAll(() => {
  const { workspaceId: wid, agentName: an } = prepareHerdr({
    workspaceLabel: "my-test",
    agentName: "test-agent",
  });
  workspaceId = wid;
  agentName = an;
}, 120_000);

afterAll(() => {
  closeHerdrWorkspace(workspaceId);
});

describe("My feature", () => {
  it("responds to a prompt", () => {
    const result = promptHerdrAgent(agentName, "hello");
    expect(result).toHaveProperty("result");
  });
});
```

Run with: `just test`

---

## Debugging

### Check current agents

```bash
herdr agent list
```

Shows all running agents with their kind, pane, and status.

### Inspect a specific agent

```bash
herdr agent get <agent-name>
```

Shows detailed agent info including `interactive_ready`, `pane_id`, `agent_status`.

### Read terminal output

```bash
herdr agent read <agent-name> --source recent --lines 100
```

Sources: `visible` (current screen), `recent` (scrollback), `recent-unwrapped` (raw).

### Explain detection state

```bash
herdr agent explain <agent-name> --verbose
```

Shows how Herdr detected the agent (rules, manifest matches, etc.).

---

## Common Pitfalls

### `agent_kind_mismatch` error

```
{"error":{"code":"agent_kind_mismatch","message":"expected mastracode, detected omp"}}
```

**Cause:** The process running in the pane doesn't match the expected agent kind.

**Fix:** Ensure the process title is set correctly. For dev mode (`npx tsx`), set `NEXUS_DEV_MODE=1` so `index.ts` sets `process.title = "mastracode"`.

### Agent name collision

```
agent name X is already used; candidates: pane_id=w42:p1
```

**Cause:** Another agent with the same name is already running.

**Fix:** Use unique agent names per test run (e.g. `agent-${randomHex}`).

### Agent not ready

**Cause:** The agent hasn't finished initializing when you query it.

**Fix:** Wait a moment after starting, or use `herdr agent wait <name>` to wait for a specific state.

---

## CLI Reference

| Command | Description |
|---------|-------------|
| `herdr workspace create [--label LABEL]` | Create a workspace |
| `herdr workspace close <ID>` | Close a workspace |
| `herdr agent list` | List all agents |
| `herdr agent get <name>` | Show agent details |
| `herdr agent start <name> --kind <kind> --pane <id>` | Start an agent |
| `herdr agent prompt <name> "<text>"` | Send a prompt |
| `herdr agent read <name>` | Read terminal output |
| `herdr agent send-keys <name> <keys>` | Send key presses |
| `herdr agent explain <name>` | Show detection state |
| `herdr pane split --pane <id> --direction right` | Split a pane |
| `herdr pane close <id>` | Close a pane |
| `herdr workspace list` | List workspaces |
