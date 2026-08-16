# Factory — Workflow Schema Reference

The factory package uses **Zod schemas** as the single source of truth for workflow structure.
All TypeScript types are derived from these schemas via `z.infer`.

Workflows are defined as **pure TypeScript objects** — not YAML. This makes them immediately
readable, type-checked, and checkable into version control without any serialization layer.

## Quick start

```ts
import { WorkflowFileSchema, WorkflowInputSchema } from "@nexus/factory";

const result = WorkflowFileSchema.safeParse(yourObject);

if (!result.success) {
  console.error(result.error.format());
}
```

## Schema overview

### Input (`WorkflowInputSchema`)

Each input definition has:

| Field         | Required | Type                 | Description                                |
| ------------- | -------- | -------------------- | ------------------------------------------ |
| `name`        | yes      | `string`             | Unique input name, used as `{{name}}`      |
| `type`        | no       | `"string" \| "number" \| "boolean"` | Value type for validation (default: `"string"`) |
| `description` | no       | `string`             | Human-readable help text                   |
| `default`     | no       | `string`             | Fallback value if caller provides nothing  |

Supported input types:

- **`"string"`** — any string value (default)
- **`"number"`** — coerced/validated as a number; rejected if non-numeric
- **`"boolean"`** — accepts `"true"` / `"false"` / `"1"` / `"0"` / `"yes"` / `"no"`

### Step (`WorkflowStepSchema`)

A discriminated union on `type`:

**Bash step:**

| Field               | Required | Type       | Description                              |
| ------------------- | -------- | ---------- | ---------------------------------------- |
| `id`                | yes      | `string`   | Unique identifier, used for `<previous-output>` |
| `type`              | yes      | `"bash"`   | Literal `"bash"`                         |
| `command`           | yes      | `string`   | Shell command to execute                 |
| `output`            | no       | `string`   | Unique name for this step's stdout. Readable by downstream steps via `<output:name>`. When omitted, output is discarded. |
| `validation_prompt` | no       | `string`   | Text Nexus checks for pass/fail          |
| `inputs`            | no       | `Input[]`  | Step-local inputs (only this step sees them) |

**Agent step:**

| Field     | Required | Type       | Description                              |
| --------- | -------- | ---------- | ---------------------------------------- |
| `id`      | yes      | `string`   | Unique identifier, used for `<previous-output>` |
| `type`    | yes      | `"agent"`  | Literal `"agent"`                        |
| `agent`   | yes      | `string`   | Agent name to spawn (e.g. `"nexus"`)     |
| `command` | yes      | `string`   | Prompt/command to send to the agent      |
| `output`  | no       | `string`   | Unique name for this step's stdout. Readable by downstream steps via `<output:name>`. When omitted, output is discarded. |
| `inputs`  | no       | `Input[]`  | Step-local inputs (only this step sees them) |

### Control block (`ControlBlockSchema`)

A discriminated union on `type` — six control block types:

**`loop_until`** — retries the same set of steps until all pass.

| Field             | Required | Type                           | Description                              |
| ----------------- | -------- | ------------------------------ | ---------------------------------------- |
| `id`              | yes      | `string`                       | Unique identifier for the control block  |
| `type`            | yes      | `"loop_until"`                 | Sequential retry until all steps pass    |
| `max_iterations`  | no       | `number` (min 1)               | Iteration count before giving up (default: 3) |
| `inputs`          | no       | `Input[]`                      | Control-level inputs (all steps in this block) |
| `steps`           | yes      | `Step[]` (min 1)               | Steps within this control block          |

**`parallel`** — runs all steps concurrently, fails fast on first error.

| Field             | Required | Type                           | Description                              |
| ----------------- | -------- | ------------------------------ | ---------------------------------------- |
| `id`              | yes      | `string`                       | Unique identifier for the control block  |
| `type`            | yes      | `"parallel"`                   | Concurrent execution, fails fast         |
| `max_iterations`  | no       | `number` (min 1)               | Iteration count before giving up (default: 3) |
| `inputs`          | no       | `Input[]`                      | Control-level inputs (all steps in this block) |
| `steps`           | yes      | `Step[]` (min 1)               | Steps within this control block          |

**`foreach`** — iterates over items from a previous step's output, one at a time.

| Field             | Required | Type                           | Description                              |
| ----------------- | -------- | ------------------------------ | ---------------------------------------- |
| `id`              | yes      | `string`                       | Unique identifier for the control block  |
| `type`            | yes      | `"foreach"`                    | Sequential iteration over items          |
| `max_iterations`  | no       | `number` (min 1)               | Iteration count before giving up (default: 3) |
| `items`           | yes      | `string`                       | Reference to a previous step's output (via `<output:name>`) containing newline-separated items |
| `input_var`       | no       | `string`                       | The input variable name each item is exposed as (default: `"item"`). Used as `{{item}}` |
| `inputs`          | no       | `Input[]`                      | Control-level inputs (all steps in this block) |
| `steps`           | yes      | `Step[]` (min 1)               | Steps within this control block          |

**`if_else`** — conditionally runs one of two step groups based on a condition.

| Field             | Required | Type                           | Description                              |
| ----------------- | -------- | ------------------------------ | ---------------------------------------- |
| `id`              | yes      | `string`                       | Unique identifier for the control block  |
| `type`            | yes      | `"if_else"`                    | Conditionally runs one of two step groups |
| `condition`       | yes      | `string`                       | Reference to a previous step's output (via `<output:name>`). Non-empty = truthy |
| `steps`           | yes      | `Step[]` (min 1)               | Steps to run when condition is truthy    |
| `else_steps`      | no       | `Step[]` (min 1)               | Steps to run when condition is falsy     |

**`do_until`** — repeats steps until a condition becomes truthy, or max_iterations is reached.

| Field             | Required | Type                           | Description                              |
| ----------------- | -------- | ------------------------------ | ---------------------------------------- |
| `id`              | yes      | `string`                       | Unique identifier for the control block  |
| `type`            | yes      | `"do_until"`                   | Repeats until condition is truthy        |
| `max_iterations`  | no       | `number` (min 1)               | Iteration count before giving up (default: 3) |
| `condition`       | yes      | `string`                       | Reference to a previous step's output (via `<output:name>`). When non-empty, the loop exits successfully |
| `inputs`          | no       | `Input[]`                      | Control-level inputs (all steps in this block) |
| `steps`           | yes      | `Step[]` (min 1)               | Steps within this control block          |

**`do_while`** — repeats steps while a condition remains truthy, or max_iterations is reached.

| Field             | Required | Type                           | Description                              |
| ----------------- | -------- | ------------------------------ | ---------------------------------------- |
| `id`              | yes      | `string`                       | Unique identifier for the control block  |
| `type`            | yes      | `"do_while"`                   | Repeats while condition is truthy        |
| `max_iterations`  | no       | `number` (min 1)               | Iteration count before giving up (default: 3) |
| `condition`       | yes      | `string`                       | Reference to a previous step's output (via `<output:name>`). When non-empty, another iteration runs |
| `inputs`          | no       | `Input[]`                      | Control-level inputs (all steps in this block) |
| `steps`           | yes      | `Step[]` (min 1)               | Steps within this control block          |

### Workflow (`WorkflowFileSchema`)

| Field     | Required | Type                       | Description                              |
| --------- | -------- | -------------------------- | ---------------------------------------- |
| `name`    | yes      | `string` (min 1)           | Workflow identifier                      |
| `inputs`  | no       | `Input[]`                  | **Global inputs** — available to ALL steps (control + post-control) |
| `control` | no       | `ControlBlock[]`           | Control blocks (phases), run sequentially |
| `steps`   | yes      | `Step[]` (min 1)           | Final steps — run after all control blocks |

## Scoping

Inputs are resolved in this priority (closest wins):

1. **Step-local** (`step.inputs[]`) — only available to that step's commands
2. **Control-level** (`control[].inputs[]`) — available to all steps within that control block
3. **Global** (top-level `inputs[]`) — available to every step, including post-control

Example:

```ts
import { createWorkflow, addControlBlock, addStepToControl } from "@nexus/factory";

const workflow = createWorkflow("my-workflow");

addControlBlock(workflow, "loop_until", 3, [
  { id: "lint", command: "just lint {{package}} {{target}}" },
]);
```

CLI usage:

```bash
nexus factory run my-workflow --package my-pkg --target lib/ --extra --strict
```

## Template variables

| Variable              | Resolves from                        |
| --------------------- | ------------------------------------ |
| `{{input-name}}`      | The input with that name (hyphens → underscores) |
| `<previous-output>`   | Output of the immediately preceding step |
| `<output:name>`       | Named output from a step that declared `output: "name"` |
| `{{item}}`            | Each item from a `foreach` control block (configurable via `input_var`) |

## Step types

| Type    | Behavior                                      |
| ------- | --------------------------------------------- |
| `bash`  | Runs a command, captures output. Optional validation. |
| `agent` | Spawns an AI agent pane (Nexus) to reason and act. |

## Control types

| Type           | Behavior                              |
| -------------- | ------------------------------------- |
| `loop_until`   | Sequential, retries until all steps pass |
| `parallel`     | Concurrent execution, fails fast      |
| `foreach`      | Sequential iteration over items from a previous step's output |
| `if_else`      | Conditionally runs one of two step groups (supports nested control blocks) |
| `do_until`     | Repeats steps until a condition becomes truthy, or max_iterations reached (supports nested control blocks) |
| `do_while`     | Repeats steps while a condition remains truthy, or max_iterations reached (supports nested control blocks) |

### Nested control blocks

All control block types can contain other control blocks as children. This enables
complex control flow graphs:

```ts
const workflow = createWorkflow("check-automate");

// Phase 1: discover packages
addControlBlock(workflow, "loop_until", 3, [
  { id: "list-packages", command: "npx turbo ls 2>&1 | grep -E '(@extensions|@nexus)/' | sed 's/^[[:space:]]*//' | cut -d' ' -f1", output: "packages" },
]);

// Phase 2: foreach → do_until → (bash + if_else → (bash | agent))
const control = addControlBlock(workflow, "foreach", 3, [
  { id: "do-check", command: "just check {{pkg}}", output: "check-result" },
]);
```

This example shows `foreach → do_until → (bash + if_else → (bash | agent))`.

### `do_until` vs `do_while`

| Type | Exit condition | Behavior |
|------|---------------|----------|
| `do_until` | Condition becomes **truthy** (non-empty output) | Repeats until success or max_iterations |
| `do_while` | Condition becomes **falsy** (empty output) | Repeats while truthy or max_iterations |

Both support nested control blocks and can be used inside `foreach`, `parallel`, etc.

## Files

- **Schema source:** `examples/workflow-schema.ts`
- **Types (re-exported):** `packages/factory/src/types.ts`
- **Validation:** `packages/factory/src/validate.ts`
- **Examples:** `examples/workflows/check-automate.ts`
