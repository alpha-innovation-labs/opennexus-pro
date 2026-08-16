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
 * A single input definition. Can appear at top-level, control-level, or
 * step-level. Resolved from CLI args (positional or --flag) and defaults.
 */
export const WorkflowInputSchema = z.object({
	name: z.string().describe("Unique input name, used as {{name}} in commands"),
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
export type ControlType =
	| "loop_until"
	| "parallel"
	| "foreach"
	| "if_else"
	| "do_until"
	| "do_while";

// ─── Bash step ──────────────────────────────────────────────────────────────

const BashStepSchema = z.object({
	id: z.string().describe("Unique identifier, used for <previous-output> referencing"),
	type: z.literal("bash"),
	command: z.string().describe("Shell command to execute"),
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
	inputs: z.array(WorkflowInputSchema).optional().describe("Step-local inputs"),
});

// ─── Step union (discriminated on `type`) ───────────────────────────────────

export const WorkflowStepSchema = z.discriminatedUnion("type", [
	BashStepSchema,
	AgentStepSchema,
]);

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

// ─── Control block ──────────────────────────────────────────────────────────

// ─── Loop until (sequential retry) ──────────────────────────────────────────

const LoopUntilSchema = z.object({
	id: z.string().optional().describe("Unique identifier for the control block"),
	type: z.literal("loop_until"),
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
	steps: z.array(WorkflowStepSchema).min(1).describe("Steps within this control block"),
});

// ─── Parallel (concurrent, fail fast) ────────────────────────────────────────

const ParallelSchema = z.object({
	id: z.string().optional().describe("Unique identifier for the control block"),
	type: z.literal("parallel"),
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
	steps: z.array(WorkflowStepSchema).min(1).describe("Steps within this control block"),
});

// ─── Foreach (iterate over items, sequential iterations) ─────────────────────

const ForeachSchema = z.object({
	id: z.string().optional().describe("Unique identifier for the control block"),
	type: z.literal("foreach"),
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
	steps: z.array(WorkflowStepSchema).min(1).describe("Steps within this control block"),
	items: z.string().describe("Expression evaluating to an array of items (e.g., a bash output)"),
	input_var: z.string().default("item").describe("Variable name for the current item in foreach (default: 'item')"),
});

// ─── If / Else (conditional branching) ───────────────────────────────────────

const IfElseSchema = z.object({
	id: z.string().optional().describe("Unique identifier for the control block"),
	type: z.literal("if_else"),
	condition: z.string().describe("Condition string to evaluate (e.g., 'non-empty', 'contains:foo')"),
	steps: z.array(WorkflowStepSchema).min(1).describe("Steps to run if condition is truthy"),
	other_steps: z.array(WorkflowStepSchema).optional().describe("Steps to run if condition is falsy"),
});

// ─── Do Until (repeat until condition is truthy) ─────────────────────────────

const DoUntilSchema = z.object({
	id: z.string().optional().describe("Unique identifier for the control block"),
	type: z.literal("do_until"),
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
	steps: z.array(WorkflowStepSchema).min(1).describe("Steps within this control block"),
	condition: z.string().describe("Condition string to evaluate after each iteration"),
});

// ─── Do While (repeat while condition is truthy) ─────────────────────────────

const DoWhileSchema = z.object({
	id: z.string().optional().describe("Unique identifier for the control block"),
	type: z.literal("do_while"),
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
	steps: z.array(WorkflowStepSchema).min(1).describe("Steps within this control block"),
	condition: z.string().describe("Condition string to evaluate after each iteration"),
});

// ─── Unified control block (discriminated union) ─────────────────────────────

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
