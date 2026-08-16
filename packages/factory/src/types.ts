/**
 * Factory types — re-exported from the Zod schema.
 *
 * All types are derived from `schema.ts` via `z.infer`. Do not define types
 * here — keep the schema as the single source of truth.
 *
 * @packageDocumentation
 */

export type {
	Workflow,
	WorkflowFile,
	WorkflowStep,
	ControlBlock,
	StepType,
	ControlType,
	WorkflowInput,
	ValidationError,
} from "./schema.js";
