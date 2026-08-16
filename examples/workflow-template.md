# Workflow Structure

A workflow defines a sequence of automated and AI-driven steps, orchestrated through control blocks that govern execution order, iteration, and validation.

## Top Level

- **`name`** — the workflow's identifier (e.g. `dev`, `agora`)
- **`steps`** — final steps that run after all control blocks finish (always sequential)

## Control Blocks (`control`)

Each control block defines a **phase** of execution with its own loop mode:

- **`type`** — either `loop_until` (sequential, retry until pass) or `parallel` (concurrent, fail fast)
- **`max_iterations`** — how many times to iterate before giving up

## Steps (inside a control block)

Each step has:

- **`id`** — a unique identifier used for output referencing (`<previous-output>`)
- **`type`** — either `bash` (automated command) or `agent` (interactive AI pane)
- **`command`** — the command to execute
- **`validation_prompt`** (bash only) — what Nexus checks to determine pass/fail

## Step Types

| Type | Behavior |
|---|---|
| **`bash`** | Runs a command, captures output. If validation fails, the loop retries or the next step sees the failure. |
| **`agent`** | Spawns a persistent AI agent pane (Nexus) to inspect, reason, and fix the issue from `<previous-output>`. |

## Output Passing

Steps reference the immediately preceding step's output via `<previous-output>` templates, resolved by node ID. No global state — each step only sees its predecessor.
