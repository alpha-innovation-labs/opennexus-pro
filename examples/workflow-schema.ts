/**
 * Workflow Schema — Zod definitions for workflow YAML structure.
 *
 * This is the single source of truth for the workflow format. TypeScript types
 * are derived from these schemas. The mega template YAML is generated from them.
 *
 * @packageDocumentation
 */

import { z } from "zod";

// ─── Input definition (reusable) ────────────────────────────────────────────

/**
 * Supported input value types for validation.
 */
export type InputValueType = "string" | "number" | "boolean";

/**
 * A single input definition. Can appear at top-level, control-level, or
 * step-level. Resolved from CLI args (positional or --flag) and defaults.
 *
 * The `type` field determines what values are accepted:
 *   - "string"  — any string (default)
 *   - "number"  — coerced/validated as a number
 *   - "boolean" — "true" | "false" | "1" | "0" | "yes" | "no"
 */
export const WorkflowInputSchema = z.object({
	name: z.string().describe("Unique input name, used as {{name}} in commands"),
	type: z
		.enum(["string", "number", "boolean"])
		.default("string")
		.describe("Value type to validate against"),
	description: z
		.string()
		.optional()
		.describe("Human-readable description for help text"),
	default: z.string().optional().describe("Fallback value if not provided by caller"),
});

export type WorkflowInput = z.infer<typeof WorkflowInputSchema>;

// ─── Step types ─────────────────────────────────────────────────────────────

/**
 * Possible step types within a workflow.
 */
export type StepType = "bash" | "agent";

/**
 * Possible control block types that wrap a group of steps.
 */
export type ControlType = "loop_until" | "parallel" | "foreach" | "if_else" | "do_until" | "do_while";

// ─── Bash step ──────────────────────────────────────────────────────────────

const BashStepSchema = z.object({
	id: z.string().describe("Unique identifier, used for <previous-output> referencing"),
	type: z.literal("bash"),
	command: z.string().describe("Shell command to execute"),
	output: z
		.string()
		.optional()
		.describe("Unique name for this step's stdout. Readable by downstream steps via <output:name>. When omitted, output is discarded."),
	validation_prompt: z
		.string()
		.optional()
		.describe("Text Nexus checks to determine pass/fail (bash only)"),
	inputs: z.array(WorkflowInputSchema).optional().describe("Step-local inputs"),
});

// ─── Agent step ─────────────────────────────────────────────────────────────

const AgentStepSchema = z.object({
	id: z.string().describe("Unique identifier, used for <previous-output> referencing"),
	type: z.literal("agent"),
	agent: z.string().describe("Agent name to spawn (e.g. 'nexus')"),
	command: z.string().describe("Prompt/command to send to the agent"),
	output: z
		.string()
		.optional()
		.describe("Unique name for this step's stdout. Readable by downstream steps via <output:name>. When omitted, output is discarded."),
	inputs: z.array(WorkflowInputSchema).optional().describe("Step-local inputs"),
});

// ─── Step union (discriminated on `type`) ───────────────────────────────────

export const WorkflowStepSchema = z.discriminatedUnion("type", [
	BashStepSchema,
	AgentStepSchema,
]);

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

// ─── Control block ──────────────────────────────────────────────────────────

/**
 * Shared fields across all control block types.
 */
const ControlBlockBaseSchema = z.object({
	id: z.string().describe("Unique identifier for the control block"),
	max_iterations: z
		.number()
		.int()
		.min(1)
		.default(3)
		.describe("How many iterations before giving up"),
	inputs: z
		.array(WorkflowInputSchema)
		.optional()
		.describe("Control-level inputs available to all steps in this block"),
	steps: z.array(z.union([WorkflowStepSchema, ControlBlockSchema])).min(1).describe("Steps or nested control blocks within this control block"),
});

/**
 * `loop_until` — retries the same set of steps until all pass.
 */
const LoopUntilSchema = ControlBlockBaseSchema.extend({
	type: z.literal("loop_until").describe("Sequential retry until all steps pass"),
});

/**
 * `parallel` — runs all steps concurrently, fails fast on first error.
 */
const ParallelSchema = ControlBlockBaseSchema.extend({
	type: z.literal("parallel").describe("Concurrent execution, fails fast"),
});

/**
 * `foreach` — iterates over items from a previous step's output, one at a time.
 */
const ForeachSchema = ControlBlockBaseSchema.extend({
	type: z.literal("foreach").describe("Sequential iteration over items from a previous step's output"),
	items: z
		.string()
		.describe("Reference to a previous step's output (via <output:name>) containing newline-separated items to iterate over."),
	input_var: z
		.string()
		.default("item")
		.describe("The input variable name each item is exposed as (default: 'item'). Used as {{item}} in commands."),
});

/**
 * `if_else` — conditionally runs one of two step groups.
 * The `condition` references a previous step's output (via <output:name>).
 * If the output is a non-empty string (truthy), `steps` runs.
 * If the output is empty (falsy), `else_steps` runs.
 */
const IfElseSchema = z.object({
	id: z.string().describe("Unique identifier for the control block"),
	type: z.literal("if_else").describe("Conditionally runs one of two step groups based on a condition"),
	condition: z
		.string()
		.describe("Reference to a previous step's output (via <output:name>). Non-empty = truthy = steps, empty = falsy = else_steps."),
	steps: z.array(z.union([WorkflowStepSchema, ControlBlockSchema])).min(1).describe("Steps or nested control blocks to run when condition is truthy"),
	else_steps: z
		.array(z.union([WorkflowStepSchema, ControlBlockSchema]))
		.min(1)
		.optional()
		.describe("Steps or nested control blocks to run when condition is falsy (required when condition can be false)"),
});

/**
 * `do_until` — repeats steps until a condition becomes truthy, or max_iterations is reached.
 * The `condition` references a previous step's output (via <output:name>).
 * If max_iterations is reached without the condition becoming truthy, the control block
 * fails and the workflow can choose to break or continue (depending on context).
 */
const DoUntilSchema = ControlBlockBaseSchema.extend({
	type: z.literal("do_until").describe("Repeats steps until a condition becomes truthy, or max_iterations is reached"),
	condition: z
		.string()
		.describe("Reference to a previous step's output (via <output:name>). When non-empty, the loop exits successfully. When empty, another iteration runs (or max_iterations is hit)."),
});

/**
 * `do_while` — repeats steps while a condition remains truthy, or max_iterations is reached.
 * The `condition` references a previous step's output (via <output:name>).
 * If max_iterations is reached while the condition is still truthy, the loop exits.
 */
const DoWhileSchema = ControlBlockBaseSchema.extend({
	type: z.literal("do_while").describe("Repeats steps while a condition remains truthy, or max_iterations is reached"),
	condition: z
		.string()
		.describe("Reference to a previous step's output (via <output:name>). When non-empty, another iteration runs (up to max_iterations). When empty, the loop exits."),
});

/**
 * All control block types as a discriminated union on `type`.
 */
export const ControlBlockSchema = z.discriminatedUnion("type", [
	LoopUntilSchema,
	ParallelSchema,
	ForeachSchema,
	IfElseSchema,
	DoUntilSchema,
	DoWhileSchema,
]);

export type ControlBlock = z.infer<typeof ControlBlockSchema>;

// ─── Workflow (file format — what YAML serializes to) ───────────────────────

export const WorkflowFileSchema = z.object({
	prompt: z
		.string()
		.describe("Human-readable description of what the workflow does"),
	name: z.string().min(1).describe("Workflow identifier"),
	inputs: z
		.array(WorkflowInputSchema)
		.optional()
		.describe("Global inputs available to ALL steps (control + post-control)"),
	control: z.array(ControlBlockSchema).optional().describe("Control blocks (phases)"),
	steps: z.array(WorkflowStepSchema).optional().describe("Final steps (run after all control blocks)"),
});

export type WorkflowFile = z.infer<typeof WorkflowFileSchema>;

// ─── In-memory representation ───────────────────────────────────────────────

/**
 * A Workflow object returned by the factory API.
 * This is the programmatic representation — saveWorkflow serialises it
 * to a WorkflowFile for YAML output.
 */
export type Workflow = WorkflowFile;

// ─── Validation errors ──────────────────────────────────────────────────────

export interface ValidationError {
	path: string;
	message: string;
	code: string;
}

// ─── Re-export types ────────────────────────────────────────────────────────

export type { StepType, ControlType };
