# Factory Engine — Design Document

## Goal

The factory engine executes workflow definitions (YAML files) as **deterministic, observable state machines**. A workflow describes a sequence of steps — bash commands and AI agent prompts — organized through control blocks that govern execution order, iteration, branching, and concurrency.

The engine's job is simple: read a workflow, resolve all template variables and inputs, then walk the control flow graph step by step, capturing output at each junction so downstream steps can reference it.

## Core Principle

The engine is a **state machine with template resolution**. It has no external dependencies beyond `execa` (for spawning bash processes). Everything else is domain logic — a few hundred lines of TypeScript.

No event emitters. No reactive streams. No workflow orchestration frameworks. Just async functions, conditionals, and loops.

## Structural Elements

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

A dispatch that routes execution by step type:

- **`bash`** — spawns a shell process via `execa`, captures stdout/stderr, respects timeouts, and returns a `StepResult`. Optionally runs a `validation_prompt` against the output.
- **`agent`** — spawns an AI agent (Nexus) with the step's command as a prompt, captures the agent's response, and returns a `StepResult`.

Each executor is self-contained and knows only how to run its step type. It receives the context and returns a result.

### 5. Control Block Executor

A dispatch that handles control flow semantics for each block type:

- **`loop_until`** — retries the same set of steps sequentially until all pass, or `max_iterations` is reached.
- **`parallel`** — runs all steps concurrently with `Promise.all`. Fails fast on the first error.
- **`foreach`** — iterates sequentially over newline-separated items from a previous step's output, executing the inner steps for each item.
- **`if_else`** — conditionally runs one of two step groups based on whether a referenced output is non-empty.
- **`do_until`** — repeats steps until a condition becomes truthy, or `max_iterations` is reached.
- **`do_while`** — repeats steps while a condition remains truthy, or `max_iterations` is reached.

Control blocks can be **nested** — a control block may contain other control blocks as children. This is handled by recursion: each control executor calls a generic `executeSteps()` function, which either runs raw steps or delegates to another control executor.

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
3. Initializes an empty context.
4. Executes control blocks sequentially (if any), then final steps.
5. Returns a `WorkflowResult` summarizing the execution: total steps, passed/failed counts, duration, and any errors.

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

- **Error handling strategies** — how the engine handles process crashes, timeouts, and agent failures.
- **Input file formats** — YAML parsing is handled by the existing `loadWorkflow` function.
- **CLI integration** — how the engine is invoked from `nexus factory run`.
- **TUI integration** — how the engine's logger feeds into the terminal UI.

These are implementation details. The structural elements above are the contract.
