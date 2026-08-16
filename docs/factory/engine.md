# Factory Engine — Design Document

## Goal

The factory engine executes workflow definitions (YAML files) as **deterministic, observable state machines**. A workflow describes a sequence of steps — bash commands and AI agent prompts — organized through control blocks that govern execution order, iteration, branching, and concurrency.

The engine's job is simple: read a workflow, resolve all template variables and inputs, then walk the control flow graph step by step, capturing output at each junction so downstream steps can reference it.

## Core Principle

The engine is a **state machine with template resolution**, executed inside **Herdr panes**. Each step runs independently in its own pane — no shared processes, no cross-step interference. Everything else is domain logic — a few hundred lines of TypeScript.

No event emitters. No reactive streams. No workflow orchestration frameworks. Just async functions, conditionals, and loops.

## Execution Model: Herdr Pane Hierarchy

Every workflow execution maps to a Herdr workspace, and every structural element maps to a pane level:

| Workflow element | Herdr construct | Isolation |
|---|---|---|
| **Workflow** | Workspace (named after the workflow) | Full isolation — each workflow gets its own workspace |
| **Control block** | Tab | Each control block gets its own tab |
| **Foreach iteration** | Tab | Each iteration (e.g. iteration 0, 1, 2…) gets its own tab |
| **Step** | Pane | Each step (bash or agent) gets its own pane inside the relevant tab |
| **Parallel steps** | Panes side by side | Multiple panes in the same tab, all executing concurrently |
| **Chained steps** | Panes stacked vertically | Sequential panes in the same tab |

### Workspace creation

When a workflow starts, the engine creates a dedicated Herdr workspace named after the workflow. This workspace is the execution boundary — all panes, tabs, and agents for that workflow live inside it. No other workflow shares this workspace.

### Tab creation

Each control block (or each `foreach` iteration) gets its own tab. This gives visual and logical separation between execution phases. The tab is created before any steps within it begin executing.

### Pane creation

Every step — whether `bash` or `agent` — executes inside its own pane. The pane is created within the tab that corresponds to the step's containing control block (or iteration). The step's command (resolved by the Template Resolver) is sent into the pane as a command. For `bash` steps, the engine runs the command via `herdr_run_command` and reads the output via `herdr_read_pane`. For `agent` steps, the engine spawns an agent via `herdr_start_agent` (or `herdr_delegate` for one-shot) and reads the response via `herdr_read_agent`.

After a step completes, its output is captured and made available to the context. The pane remains alive so its output can be inspected later (useful for debugging), but the engine does not wait for manual interaction — it moves on once the step's result is captured.

### Parallel vs. sequential layout

- **Sequential steps** (normal flow, `loop_until`, `foreach` iterations): panes are created one after another, stacked vertically within the same tab. The engine waits for each pane to finish before creating the next.
- **Parallel steps** (`parallel` block): all steps in the block are created as panes in the same tab, side by side. The engine fires them all simultaneously and collects results via `Promise.all`. If any step fails, the engine invokes fail-fast — aborting remaining parallel steps.
- **Nested control blocks**: a control block inside another control block creates a nested tab structure. The outer block's tab contains the inner block's tab, which contains the steps' panes.

### Example: a `foreach` with three iterations, each having three steps

```
Workspace: "my-workflow"
  Tab: "foreach iteration 0"
    Pane: step 1 (bash)
    Pane: step 2 (agent)
    Pane: step 3 (bash)
  Tab: "foreach iteration 1"
    Pane: step 1 (bash)
    Pane: step 2 (agent)
    Pane: step 3 (bash)
  Tab: "foreach iteration 2"
    Pane: step 1 (bash)
    Pane: step 2 (agent)
    Pane: step 3 (bash)
```

Each pane is fully independent — no shared process state, no cross-pane interference. The engine coordinates them through the context object, which collects outputs and feeds them into template resolution for downstream steps.

## Structural Elements

### 0. Pane Manager (execution substrate)

The engine uses Herdr's pane API as its execution substrate. Every step runs inside a Herdr pane — either a raw terminal pane (for `bash` steps) or an agent pane (for `agent` steps). The engine manages the full lifecycle:

- **`herdr_split_pane`** — creates a raw terminal pane for `bash` steps.
- **`herdr_run_command`** — sends the resolved command into the pane.
- **`herdr_read_pane`** — captures stdout/stderr from the pane after execution.
- **`herdr_wait_output`** — waits for expected output markers (e.g., a server "ready" line) before proceeding.
- **`herdr_start_agent`** / **`herdr_delegate`** — spawns an AI agent pane for `agent` steps.
- **`herdr_read_agent`** — captures the agent's response.
- **`herdr_wait_agent`** — waits for an agent to reach idle (finished).

The engine creates the workspace and all tabs/panes up front when the workflow starts, then populates them as execution progresses. Panes are not destroyed after each step — they remain visible for inspection, debugging, and TUI rendering.

### 1. Context

The context is the single object that flows through every step of a workflow. It carries all state the engine needs to make decisions:

- **`outputs`** — a map of named outputs from any step that declared one. Downstream steps reference these via `<output:name>`.
- **`previousOutput`** — the stdout of the immediately preceding step. Available to every step as `<previous-output>`.
- **`inputs`** — resolved input values, merged in priority order: step-local → control-level → global → CLI overrides.
- **`iteration`** — the current loop iteration count (for `loop_until`, `do_until`, `do_while`, `foreach`).
- **`failed`** — whether any prior step in this execution path failed (for fail-fast on `parallel` blocks).

The context is immutable per-step — each step receives a snapshot, and the engine produces a new context after each step completes.

### 2. Step Result

Every step returns a result object describing what happened:

- **`success`** — whether the step completed without error.
- **`output`** — captured stdout (or `null` if the step declared no output).
- **`validationPassed`** — whether a `validation_prompt` (if present) matched the output. Only relevant for `bash` steps.
- **`error`** — an error message, if the step failed.

### 3. Template Resolver

A pure function that replaces template variables in step commands with actual values from the context. It handles:

- **`{{input-name}}`** — resolved from the inputs map (hyphens → underscores).
- **`<previous-output>`** — the stdout of the immediately preceding step.
- **`<output:name>`** — a named output from any prior step.
- **`{{item}}`** — the current item in a `foreach` iteration (configurable via `input_var`).

Template resolution happens **before** a step executes, so the step's command string is fully resolved at spawn time.

### 4. Step Executor

A dispatch that routes execution by step type, always executing inside a Herdr pane:

- **`bash`** — the engine creates (or reuses) a raw terminal pane via `herdr_split_pane`, sends the resolved command via `herdr_run_command`, and reads the output via `herdr_read_pane`. Respects timeouts, captures stdout/stderr, and optionally runs a `validation_prompt` against the output.
- **`agent`** — the engine spawns an agent pane via `herdr_start_agent` (or uses `herdr_delegate` for one-shot execution), sends the resolved command as a prompt, waits for the agent to finish via `herdr_wait_agent`, and reads the response via `herdr_read_agent`.

Each executor is self-contained and knows only how to run its step type. It receives the context and returns a result. The key constraint: **every step runs in its own pane**, ensuring full isolation between concurrent and sequential steps.

### 5. Control Block Executor

A dispatch that handles control flow semantics for each block type, mapping each to the appropriate Herdr tab/pane layout:

- **`loop_until`** — retries the same set of steps sequentially within the same tab. The engine reuses existing panes or creates new ones for each retry iteration, waiting for each to complete before proceeding.
- **`parallel`** — creates all steps as panes in the same tab, side by side, then fires them all simultaneously. Collects results via `Promise.all`. Fails fast on the first error — the engine sends `ctrl+c` or closes remaining panes.
- **`foreach`** — creates a new tab for each iteration (e.g., "iteration 0", "iteration 1"), each containing the inner steps as panes. Iterations execute sequentially.
- **`if_else`** — conditionally creates panes for one of two step groups based on whether a referenced output is non-empty. The other group's tab/panes are never created.
- **`do_until`** — repeats steps until a condition becomes truthy, creating new panes or reusing existing ones for each iteration.
- **`do_while`** — repeats steps while a condition remains truthy, or `max_iterations` is reached.

Control blocks can be **nested** — a control block may contain other control blocks as children. Nested blocks create nested tab structures: the outer block's tab contains the inner block's tab, which contains the steps' panes. This is handled by recursion: each control executor calls a generic `executeSteps()` function, which either runs raw steps or delegates to another control executor.

### 6. Logger

A callback interface that the engine invokes at key moments:

- **`stepStart`** — a step is about to execute.
- **`stepEnd`** — a step completed (success or failure).
- **`blockStart`** — a control block is about to execute.
- **`blockEnd`** — a control block completed.
- **`error`** — an unexpected error occurred.

The default logger writes to `console.log` and `console.error`. The interface is pluggable — tests, CI, or a TUI can provide their own logger that emits structured events, renders progress bars, or streams to a dashboard.

### 7. Input Resolver

A pure function that resolves inputs according to the scoping priority:

1. **Step-local inputs** — only available to that step's command.
2. **Control-level inputs** — available to all steps within that control block.
3. **Global inputs** — available to every step, including post-control.

CLI arguments override defaults. If no CLI argument is provided, the step's declared `default` is used. If neither exists, the input is undefined (and the template variable remains unresolved, causing a runtime error).

### 8. Workflow Runner

The top-level entry point. It:

1. Loads and validates the workflow (existing Zod-based validation).
2. Resolves all inputs into a resolved map.
3. Creates a dedicated Herdr workspace named after the workflow.
4. Initializes an empty context.
5. Executes control blocks sequentially (if any), creating tabs and panes as needed.
6. Executes final steps (sequential, after all control blocks).
7. Returns a `WorkflowResult` summarizing the execution: total steps, passed/failed counts, duration, and any errors.

The runner is responsible for the full Herdr workspace lifecycle: creating the workspace and tabs, creating and populating panes, collecting step results, and cleaning up (or leaving panes visible for inspection) when execution completes.

## Execution Flow

```
Workflow (YAML)
  → Input Resolver  (resolve inputs, merge priorities)
  → Context         (initialize empty state bag)
  → Control Blocks  (sequential, each may be nested)
    → Step Executor  (bash or agent)
    → Template Resolver  (resolve variables for next step)
  → Final Steps     (sequential)
  → Workflow Result  (summary: duration, pass/fail, errors)
```

## Design Decisions

### Why not a workflow library?

Libraries like Temporal, Airflow, or Prefect are designed for distributed, long-running, cloud-hosted workflows. The factory is:

- **Local-first** — runs on the developer's machine.
- **Short-lived** — workflows complete in seconds to minutes, not hours.
- **YAML-defined** — human-readable, version-controllable, editable by hand.
- **Simple control flow** — 6 control block types, not a full programming language.

These libraries add orchestration, persistence, and distributed execution — none of which the factory needs.

### Why not a state machine library?

The control blocks are a state machine, but they're simple enough to express as recursive async functions. A state machine library would add:

- State definitions (transitions, events, guards).
- State tracking (current state, history, pending transitions).
- A library API (enter, exit, transition).

The factory's state machine is just: "run these steps, maybe retry, maybe branch, maybe iterate." That's `if`/`for`/`await` in ~200 lines.

### Why one context object?

All state flows through a single context object because:

- **Template resolution** needs to look up outputs, inputs, and previous output — all from one place.
- **Scoping** (step → control → global) is resolved once into the context at step boundaries.
- **Debugging** is easier when you can log one object instead of tracking state across closures.

### Why a logger interface instead of a logging library?

A logging library adds:

- Configuration (levels, formats, transports).
- Structured logging (JSON, fields, correlation IDs).
- Performance overhead (buffering, async writes).

The factory's logging needs are:

- **Human-readable output** during development (`console.log`).
- **Structured events** during testing (a test logger that collects results).
- **UI updates** in the TUI (a logger that renders progress).

A callback interface satisfies all three with zero dependencies.

## What This Document Omits

- **Error handling strategies** — how the engine handles process crashes, timeouts, and agent failures within panes.
- **Input file formats** — YAML parsing is handled by the existing `loadWorkflow` function.
- **CLI integration** — how the engine is invoked from `nexus factory run`.
- **TUI integration** — how the engine's logger feeds into the terminal UI.
- **Pane lifecycle management** — when panes are closed vs. kept alive, workspace cleanup on completion.

These are implementation details. The structural elements above are the contract.
