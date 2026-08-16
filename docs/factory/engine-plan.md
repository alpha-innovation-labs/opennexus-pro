# Factory Engine — Implementation Plan

## Overview

This document describes what needs to be built in `packages/factory/src/engine/` to turn the existing schema/CLI layer (workflow loading, validation, CRUD) into a **runtime engine** that executes workflows as deterministic state machines inside Herdr panes.

The engine is thin glue — a few hundred lines of TypeScript. It walks the control flow graph, resolves templates, spawns Herdr panes, collects output, and returns a result.

---

## Phase 0 — Prerequisites (already exist)

The following are already implemented and available:

- **Schema** — `schema.ts` defines `WorkflowInputSchema`, `WorkflowStepSchema`, `ControlBlockSchema`, `WorkflowFileSchema` (Zod).
- **Types** — `types.ts` re-exports `Workflow`, `WorkflowFile`, `WorkflowStep`, `ControlBlock`, `StepType`, `ControlType`, `WorkflowInput`, `ValidationError`.
- **Load/Save** — `save.ts` exports `saveWorkflow`, `loadWorkflow`, `deleteWorkflow`.
- **Validate** — `validate.ts` exports `validateWorkflow`.
- **Query** — `query.ts` exports `findNodes`, `walkWorkflow`.
- **CLI** — `cli/runFactoryCommand.ts` handles `list`, `explain`, `paths`, `read`, `validate`, `validate-file`.
- **Herdr API** — `packages/herdr/src/index.ts` exports:
  - `runHerdr(args, { timeoutMs })` — core primitive, spawns `herdr` CLI, parses JSON.
  - `drill(result, ...path)` — navigates nested result objects.
  - `createHerdrWorkspace({ label, cwd, env, focus })` → `{ workspaceId, rootPaneId }`.
  - `createHerdrTab({ workspaceId, label, cwd, env, focus })` → `{ tabId }`.
  - `startHerdrAgent(paneId, { maxWaitSeconds })` → `agentName`.
  - `promptHerdrAgent(agentName, promptText, { timeoutMs })` → settles agent.
  - `sendTextToAgent(agentName, text)` — sends text + Enter.
  - `sendKeysToAgent(agentName, ...keys)` — sends key presses.
  - `splitPaneRight()` → `paneId`.
  - `startForegroundAgent(agentName, paneId, options)` — foreground blocking agent.
  - `listHerdrPanes(workspaceId?)` → pane summaries.
  - `getHerdrPane(paneId)` → `{ paneId, agent, status, cwd }`.
  - `closeHerdrPane(paneId)` — closes a pane.
  - `listHerdrTabs(workspaceId?)` → tab summaries.
  - `getHerdrTab(tabId)` → `{ tabId, label, number, paneCount }`.
  - `closeHerdrTab(tabId)` — closes a tab.
  - `listHerdrWorkspaces()` → workspace summaries.
  - `getHerdrWorkspace(workspaceId)` → workspace details.
  - `closeHerdrWorkspace(workspaceId)` — closes workspace.
  - `prepareHerdr(options)` — prepares a Herdr session.

**Gap:** The Herdr API does **not** currently export wrappers for:
- `herdr run-command` (run a shell command in a pane)
- `herdr pane read` (read terminal output from a raw pane)
- `herdr agent read` (read agent output text)
- `herdr agent wait` (wait for agent to reach idle/done/blocked)
- `herdr agent stop` (stop/kill an agent)

These are needed by the engine but are not currently exported from `packages/herdr/src/index.ts`.

---

## Phase 1 — Herdr API wrappers (new files in `packages/herdr/src/`)

### 1.1 `runCommandInPane(paneId, command, { timeoutMs })` → `{ success, output, error? }`

Sends a shell command to a raw terminal pane via `herdr pane run <paneId> <command>`. Returns stdout/stderr.

### 1.2 `readPaneOutput(paneId, { lines, source })` → `{ _raw: string }`

Reads terminal output from a raw pane via `herdr pane read <paneId>`.

### 1.3 `readAgentOutput(agentName, { lines, source })` → `{ _raw: string }`

Reads text output from an agent pane via `herdr agent read <agentName>`.

### 1.4 `waitAgent(agentName, { status, timeoutMs })` → `Record<string, unknown>`

Waits for an agent to reach a specific status (idle, done, blocked) via `herdr agent wait`.

### 1.5 `stopAgent(agentName)` → `number`

Stops/kills an agent via `herdr agent stop`.

### 1.6 Export these from `packages/herdr/src/index.ts`

Add the new functions to the existing exports.

---

## Phase 2 — Engine core (new files in `packages/factory/src/engine/`)

### 2.1 `types.ts` — Engine type definitions

```typescript
// Context — single bag flowing through every step
interface Context {
  outputs: Record<string, string | null>;  // named outputs: stepId → output
  previousOutput: string | null;            // stdout of immediately preceding step
  inputs: Record<string, string | undefined>; // resolved inputs (step → control → global)
  iteration: number;                        // current loop iteration count
  failed: boolean;                          // whether any prior step failed
}

// StepResult — what each step returns
interface StepResult {
  success: boolean;
  output: string | null;
  validationPassed: boolean | null;  // null for agent steps
  error: string | null;
}

// WorkflowResult — what the runner returns
interface WorkflowResult {
  totalSteps: number;
  passed: number;
  failed: number;
  durationMs: number;
  errors: Array<{ stepId?: string; message: string; type: string }>;
}

// Logger — callback interface (not a library)
interface Logger {
  stepStart: (stepId: string, stepType: string) => void;
  stepEnd: (stepId: string, result: StepResult) => void;
  blockStart: (blockType: string, blockId?: string) => void;
  blockEnd: (blockType: string, blockId?: string) => void;
  error: (message: string, context: string) => void;
}

// TemplateResolver input/output
interface TemplateContext {
  outputs: Record<string, string | null>;
  previousOutput: string | null;
  inputs: Record<string, string | undefined>;
  item?: string;  // for foreach
}

interface TemplateResolver {
  (template: string, ctx: TemplateContext): string;
}
```

### 2.2 `templateResolver.ts` — Pure function

Replaces template variables in step commands:

- `{{input-name}}` → resolved from `inputs` map (hyphens → underscores)
- `<previous-output>` → `previousOutput`
- `<output:stepId>` → `outputs[stepId]`
- `{{item}}` → `item` (for foreach, configurable via `input_var`)

Throws if a template variable can't be resolved.

### 2.3 `stepExecutor.ts` — Dispatch by step type

```typescript
interface StepExecutor {
  (step: WorkflowStep, context: Context, options: ExecutionOptions): Promise<StepResult>;
}
```

Two implementations:

- **`bashExecutor`** — Uses `splitPaneRight()` to create a raw pane, `runCommandInPane()` to send the command, `readPaneOutput()` to capture stdout. Optionally runs `validationPrompt` against output. Respects `timeoutMs`.

- **`agentExecutor`** — Uses `startHerdrAgent()` to spawn an agent in a pane, `promptHerdrAgent()` to send the prompt, `waitAgent()` to wait for completion, `readAgentOutput()` to capture the response.

Both receive the context and return a StepResult. Each knows only its step type.

### 2.4 `controlBlockExecutor.ts` — Dispatch by control block type

```typescript
interface ControlBlockExecutor {
  (block: ControlBlock, context: Context, options: ExecutionOptions): Promise<Context>;
}
```

Six implementations, each mapping to the appropriate Herdr tab/pane layout:

- **`loopUntilExecutor`** — Retries the same set of steps sequentially within the same tab. Reuses or creates new panes per retry iteration. Stops when validation passes or `max_iterations` reached.

- **`parallelExecutor`** — Creates all steps as panes in the same tab, side by side (via `splitPaneRight()`), fires them all simultaneously via `Promise.all`. **Fails fast** on the first error — stops remaining agents/panes.

- **`foreachExecutor`** — Creates a new tab for each iteration (e.g., "iteration 0", "iteration 1"), each containing the inner steps as panes. Iterations execute sequentially. Each iteration gets a fresh context with `item` set to the current array element.

- **`ifElseExecutor`** — Evaluates the condition string against the context. If truthy, creates panes for the `steps` group. Otherwise (if `else_steps` exists), creates panes for `else_steps`. The other group's tab/panes are never created.

- **`doUntilExecutor`** — Repeats steps until a condition becomes truthy, or `max_iterations` reached. Creates new panes or reuses existing ones per iteration.

- **`doWhileExecutor`** — Repeats steps while a condition remains truthy, or `max_iterations` reached.

All control executors call a shared `executeSteps()` function, which either runs raw steps or delegates to another control executor (for nested blocks).

### 2.5 `inputResolver.ts` — Pure function

Resolves inputs according to scoping priority:

1. Step-local inputs — only available to that step's command.
2. Control-level inputs — available to all steps within that control block.
3. Global inputs — available to every step, including post-control.

CLI arguments override defaults. If no CLI argument is provided, the step's declared `default` is used. If neither exists, the input is `undefined` (template variable stays unresolved, causing a runtime error).

### 2.6 `logger.ts` — Default + interface

```typescript
const defaultLogger: Logger = {
  stepStart: (stepId, stepType) => console.log(`  ▶ ${stepId} (${stepType})`),
  stepEnd: (stepId, result) => {
    const status = result.success ? "✓" : "✗";
    console.log(`  ${status} ${stepId}: ${result.success ? "passed" : result.error}`);
  },
  blockStart: (blockType, blockId) => console.log(`  ┌ ${blockType}${blockId ? ` [${blockId}]` : ""}`),
  blockEnd: (blockType, blockId) => console.log(`  └ ${blockType}${blockId ? ` [${blockId}]` : ""}`),
  error: (message, context) => console.error(`  ✖ ${message} (${context})`),
};
```

The interface is pluggable — tests, CI, or a TUI can provide their own.

### 2.7 `runner.ts` — Top-level entry point

```typescript
interface RunWorkflowOptions {
  workflow: Workflow;
  inputs?: Record<string, string>;  // CLI overrides
  logger?: Logger;
  cwd?: string;
}

interface ExecutionOptions {
  cwd?: string;
  timeoutMs?: number;  // per-step default
}

async function runWorkflow(options: RunWorkflowOptions): Promise<WorkflowResult> {
  // 1. Validate workflow (call existing validateWorkflow)
  // 2. Resolve inputs into a map (call inputResolver)
  // 3. Create a dedicated Herdr workspace (call createHerdrWorkspace)
  // 4. Initialize empty context
  // 5. Execute control blocks sequentially (each may be nested)
  // 6. Execute final steps (sequential, after all control blocks)
  // 7. Return WorkflowResult
}
```

The runner is responsible for the full Herdr workspace lifecycle: creating the workspace and tabs, creating and populating panes, collecting step results, and cleaning up (or leaving panes visible for inspection) when execution completes.

### 2.8 Export from `packages/factory/src/index.ts`

Add to existing exports:

```typescript
// Engine (execution runtime)
export { runWorkflow, type RunWorkflowOptions, type WorkflowResult } from "./engine/runner.js";
export { type Context, type StepResult, type Logger } from "./engine/types.js";
export { templateResolver } from "./engine/templateResolver.js";
export { defaultLogger } from "./engine/logger.js";
```

---

## Phase 3 — CLI integration

### 3.1 Add `run` subcommand to `cli/runFactoryCommand.ts`

```
nexus factory run <name> [--input key=value ...]
```

- Loads the workflow by name (search `.factory/` and `examples/`).
- Parses `--input` flags into CLI overrides.
- Calls `runWorkflow()`.
- Prints `WorkflowResult` summary.
- Returns exit code 0 (success) or 1 (failure).

### 3.2 Add `hasRunFlag` to `cli/parseFactoryArgs.ts`

Parse `run` subcommand and `--input` flags.

### 3.3 Wire into `apps/tui/src/cli/runCliWithApp.ts`

Add `hasRunFlag` check alongside existing `hasFactoryFlag`.

---

## Phase 4 — Testing

### 4.1 Unit tests for pure functions

- **`templateResolver.test.ts`** — Test all template variable types:
  - `{{input-name}}` with various input values
  - `<previous-output>` with string/null
  - `<output:stepId>` with various output values
  - `{{item}}` for foreach
  - Unresolvable variables (should throw)
  - Escaping (literal `<` and `{{`)

- **`inputResolver.test.ts`** — Test scoping priority:
  - Step-local overrides control-level overrides global
  - CLI overrides defaults
  - Missing input → undefined

### 4.2 Integration test workflow — "Joke Aggregator" (Hello World)

A workflow that demonstrates the engine's core value: **parallel agent execution + consolidation**.

**File:** `examples/joke-aggregator.yaml`

```yaml
name: joke-aggregator

# User provides the joke category as input
inputs:
  - name: category
    description: "The type of joke to generate"
    default: "programming"

# Parallel block: spawn three agents simultaneously, each getting the same input
control:
  - type: parallel
    id: joke-generation
    steps:
      - id: agent-1
        type: agent
        agent: pi
        command: "Tell me a funny {{category}} joke. Keep it under 3 sentences."
        output: joke-1

      - id: agent-2
        type: agent
        agent: pi
        command: "Tell me another funny {{category}} joke. Make it a one-liner."
        output: joke-2

      - id: agent-3
        type: agent
        agent: pi
        command: "Tell me a third funny {{category}} joke. Make it a pun."
        output: joke-3

# Final steps: consolidate and display
steps:
  - id: consolidate
    type: agent
    agent: pi
    command: |
      Here are three jokes about {{category}}:

      Joke 1: <output:agent-1>
      Joke 2: <output:agent-2>
      Joke 3: <output:agent-3>

      Pick the best one and explain why. Format:
      ## Best Joke
      <the joke>

      ## Why
      <brief explanation>

      ## All Three
      1. <joke 1>
      2. <joke 2>
      3. <joke 3>
    output: final-result

  - id: display
    type: bash
    command: 'echo "<output:consolidate>"'
```

**What this tests:**

1. **Input resolution** — `{{category}}` resolved from user input (default: "programming")
2. **Parallel execution** — Three agent steps run concurrently in the same tab, side by side
3. **Named outputs** — Each agent declares `output: joke-N`, accessible via `<output:agent-N>`
4. **Template resolution across steps** — The consolidate step references all three parallel outputs
5. **Sequential flow after parallel** — Final steps run after all parallel steps complete
6. **Agent-to-agent data flow** — Outputs from parallel agents feed into a consolidating agent
7. **Bash step at the end** — Displays the final consolidated result

### 4.3 Test execution flow

```
User runs: nexus factory run joke-aggregator --input category=dad
  → loadWorkflow("joke-aggregator")
  → resolve inputs: { category: "dad" }
  → create workspace "joke-aggregator"
  → create tab "joke-generation"
  → split 3 panes, start 3 agents in parallel
  → wait for all 3 agents
  → capture outputs from all 3
  → create pane for consolidate step
  → resolve <output:agent-1>, <output:agent-2>, <output:agent-3>
  → prompt consolidating agent with all 3 jokes
  → capture consolidated result
  → create bash pane for display
  → echo the final result
  → return WorkflowResult: { totalSteps: 5, passed: 5, failed: 0, durationMs: ~45000 }
```

### 4.4 Additional test workflows

- **`sequential-bash.yaml`** — Simple sequential bash commands (hello world for bash steps)
- **`loop-compile.yaml`** — `loop_until` that compiles code until validation passes
- **`foreach-files.yaml`** — `foreach` over a list of files, processing each in its own tab
- **`if-exists.yaml`** — `if_else` that branches based on whether a file exists

### 4.5 Test infrastructure

- Use `loadWorkflow()` to load test workflow YAML files from `examples/`
- Call `runWorkflow()` with a test logger that collects events
- Assert `WorkflowResult` matches expectations
- Assert the Herdr workspace structure (workspace exists, tabs created, panes populated)

---

## Implementation order (recommended)

1. **Phase 1** — Herdr API wrappers (4-5 new files in `packages/herdr/src/`)
2. **Phase 2.1** — Engine types
3. **Phase 2.2** — Template resolver (pure, testable, no dependencies on Herdr)
4. **Phase 2.3** — Step executors (bash + agent)
5. **Phase 2.4** — Control block executors (start with `parallel`, then `foreach`, then `loop_until`, then `if_else`, then `do_until`/`do_while`)
6. **Phase 2.5** — Input resolver (pure, testable)
7. **Phase 2.6** — Logger (default implementation)
8. **Phase 2.7** — Runner (glues it all together)
9. **Phase 3** — CLI integration
10. **Phase 4** — Tests (unit + integration with joke-aggregator)

---

## Key decisions to make during implementation

- **Condition evaluation** — How are `if_else`, `do_until`, `do_while` conditions evaluated? (Suggestion: simple string comparison against the current step's output — e.g., `condition: "non-empty"` means the referenced output is not empty.)
- **Error handling** — On a bash step failure (exit code ≠ 0), does execution stop or continue? (Suggestion: continue with `success: false` in the result; `parallel` blocks fail-fast.)
- **Timeout** — Per-step default? Per-block? (Suggestion: configurable per-step, default 120s for agents, 30s for bash.)
- **Pane lifecycle** — Panes left alive after execution for inspection? (Suggestion: yes, per the engine document.)
- **Cleanup** — When is the workspace closed? (Suggestion: never automatically — the user can close it manually. Or provide a `nexus factory cleanup` command.)
