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
} from "./schema.js";

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
} from "./types.js";

export type { NodeFilter } from "./query.js";

// CLI (for the TUI to delegate to)
export { hasFactoryFlag } from "./cli/hasFactoryFlag.js";
export { parseFactoryArgs, type FactoryArgs } from "./cli/parseFactoryArgs.js";
export { runFactoryCommand } from "./cli/runFactoryCommand.js";

// Create
export { createWorkflow, addStep, addControlBlock } from "./create.js";

// Edit
export {
	editStep,
	removeStep,
	editControlBlock,
	removeControlBlock,
	addStepToControl,
	removeStepFromControl,
} from "./edit.js";

// Query
export { findNodes, walkWorkflow } from "./query.js";

// Validate
export { validateWorkflow } from "./validate.js";

// Save / Load / Delete
export { saveWorkflow, loadWorkflow, deleteWorkflow } from "./save.js";

// Error helpers
export { hasErrors, formatErrors, groupByCode } from "./errors.js";
