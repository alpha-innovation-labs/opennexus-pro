/**
 * Engine types — definitions for the workflow execution engine.
 *
 * @packageDocumentation
 */

import type { WorkflowStep, ControlBlock } from "../types.ts";

// ─── Context ────────────────────────────────────────────────────────────────

/**
 * Single bag flowing through every step. Contains resolved outputs,
 * the previous step's output, resolved inputs, iteration count, and
 * a flag indicating whether any prior step failed.
 * _paneId is an internal field tracking the current pane for step execution.
 * _rootPaneId is the initial root pane created by createHerdrWorkspace;
 * when _paneId equals _rootPaneId, the step runs in the root pane directly
 * (no split), saving one dead pane per workflow.
 */
export interface Context {
	outputs: Record<string, string | null>;
	previousOutput: string | null;
	inputs: Record<string, string | undefined>;
	iteration: number;
	failed: boolean;
	_paneId: string; // internal: current pane for step execution
	_rootPaneId?: string; // internal: root pane — first step runs here directly
	item?: string; // for foreach
}

// ─── StepResult ─────────────────────────────────────────────────────────────

/**
 * Result returned by each step execution.
 */
export interface StepResult {
	success: boolean;
	output: string | null;
	validationPassed: boolean | null; // null for agent steps
	error: string | null;
}

// ─── WorkflowResult ─────────────────────────────────────────────────────────

/**
 * Result returned by the full workflow runner.
 */
export interface WorkflowResult {
	totalSteps: number;
	passed: number;
	failed: number;
	durationMs: number;
	errors: Array<{ stepId?: string; message: string; type: string }>;
}

// ─── Logger ─────────────────────────────────────────────────────────────────

/**
 * Callback interface for engine logging. Pluggable — tests, CI, or TUI
 * can provide their own implementation.
 */
export interface Logger {
	stepStart: (stepId: string, stepType: string) => void;
	stepEnd: (stepId: string, result: StepResult) => void;
	blockStart: (blockType: string, blockId?: string) => void;
	blockEnd: (blockType: string, blockId?: string) => void;
	error: (message: string, context: string) => void;
}

// Step executor type (implemented in stepExecutor.ts)
export type StepExecutor = (
	step: WorkflowStep,
	context: Context,
	options: ExecutionOptions,
) => Promise<StepResult>;

// Control block executor type (implemented in controlBlockExecutor.ts)
export type ControlBlockExecutor = (
	block: ControlBlock,
	context: Context,
	options: ExecutionOptions,
	logger: Logger,
) => Promise<Context>;

// ─── TemplateContext ────────────────────────────────────────────────────────

/**
 * Input shape for template resolution.
 */
export interface TemplateContext {
	outputs: Record<string, string | null>;
	previousOutput: string | null;
	inputs: Record<string, string | undefined>;
	item?: string; // for foreach
}

// ─── Execution options ──────────────────────────────────────────────────────

/**
 * Options passed to step and control block executors.
 */
export interface ExecutionOptions {
	cwd?: string;
	timeoutMs?: number; // per-step default
}

/**
 * Options for the top-level runWorkflow call.
 */
export interface RunWorkflowOptions {
	workflow: import("../types.ts").Workflow;
	inputs?: Record<string, string>; // CLI overrides
	logger?: Logger;
	cwd?: string;
}
