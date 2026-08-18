/**
 * Factory — A programmatic API for creating and editing workflow YAML.
 *
 * The program (not the agent) writes YAML. Errors are caught at edit time,
 * not at lint time.
 *
 * @packageDocumentation
 */

// Schema (single source of truth — types.ts re-exports from here)
export {
	WorkflowInputSchema,
	WorkflowStepSchema,
	ControlBlockSchema,
	WorkflowFileSchema,
} from "./schema.ts";

// Types (derived from schema)
export type {
	Workflow,
	WorkflowFile,
	WorkflowStep,
	ControlBlock,
	StepType,
	ControlType,
	WorkflowInput,
	ValidationError,
} from "./types.ts";

export type { NodeFilter } from "./query.ts";

// CLI (for the TUI to delegate to)
export { hasFactoryFlag } from "./cli/hasFactoryFlag.ts";
export { parseFactoryArgs, type FactoryArgs } from "./cli/parseFactoryArgs.ts";
export { runFactoryCommand } from "./cli/runFactoryCommand.ts";

// Create
export { createWorkflow, addStep, addControlBlock } from "./create.ts";

// Edit
export {
	editStep,
	removeStep,
	editControlBlock,
	removeControlBlock,
	addStepToControl,
	removeStepFromControl,
} from "./edit.ts";

// Query
export { findNodes, walkWorkflow } from "./query.ts";

// Validate
export { validateWorkflow } from "./validate.ts";

// Save / Load / Delete
export { saveWorkflow, loadWorkflow, deleteWorkflow } from "./save.ts";

// Error helpers
export { hasErrors, formatErrors, groupByCode } from "./errors.ts";

// Engine (workflow execution)
export { runWorkflow } from "./engine/runner.ts";
export type { WorkflowResult, RunWorkflowOptions } from "./engine/types.ts";
