/**
 * Runner — top-level entry point for workflow execution.
 *
 * Orchestrates the full workflow lifecycle: validation, input resolution,
 * Herdr workspace creation, control block execution, final step execution,
 * and result collection.
 *
 * @packageDocumentation
 */

import { validateWorkflow } from "../validate.ts";
import { hasErrors, formatErrors } from "../errors.ts";
import { resolveInputsForStep } from "./inputResolver.ts";
import { defaultLogger } from "./logger.ts";
import {
	loopUntilExecutor,
	parallelExecutor,
	foreachExecutor,
	ifElseExecutor,
	doUntilExecutor,
	doWhileExecutor,
} from "./controlBlockExecutor.ts";
import { evaluateCondition } from "./controlBlockExecutor.ts";
import { executeStep, updateContext } from "./stepExecutor.ts";
import type { Workflow, WorkflowStep, ControlBlock } from "../types.ts";
import type {
	Context,
	WorkflowResult,
	ExecutionOptions,
	RunWorkflowOptions,
	StepResult,
	Logger,
} from "./types.ts";

import {
	createHerdrWorkspace,
} from "@nexus/herdr";

// Re-export the ControlBlockExecutor type for controlBlockExecutor.ts
export type { ControlBlockExecutor } from "./types.ts";

// Re-export types for the public API
export type { RunWorkflowOptions, WorkflowResult } from "./types.ts";

// Re-export executeSteps for use by controlBlockExecutor.ts
export { executeSteps };

/**
 * Runs a workflow to completion, returning a WorkflowResult.
 *
 * @param options Workflow and execution options.
 * @returns The workflow result.
 */
export async function runWorkflow(options: RunWorkflowOptions): Promise<WorkflowResult> {
	const { workflow, inputs: cliInputs = {}, logger: providedLogger, cwd } = options;
	const logger = providedLogger ?? defaultLogger;

	// 1. Validate the workflow
	const validationErrors = validateWorkflow(workflow);
	if (hasErrors(validationErrors)) {
		const errorMsg = formatErrors(validationErrors);
		logger.error(`Workflow validation failed:\n${errorMsg}`, "runWorkflow");
		return {
			totalSteps: 0,
			passed: 0,
			failed: 0,
			durationMs: 0,
			errors: [{ message: `Validation failed: ${errorMsg}`, type: "validation" }],
		};
	}

	const startTime = Date.now();

	// 2. Create a dedicated Herdr workspace
	const { workspaceId, rootPaneId } = createHerdrWorkspace({
		label: workflow.name,
		cwd,
	});

	// 3. Initialize context
	const context: Context = {
		outputs: {},
		previousOutput: null,
		inputs: {},
		iteration: 0,
		failed: false,
		_paneId: rootPaneId,
		_rootPaneId: rootPaneId,
	};

	const errors: Array<{ stepId?: string; message: string; type: string }> = [];
	let totalSteps = 0;
	let passedSteps = 0;
	let failedSteps = 0;

	// 4. Execute control blocks sequentially
	const controlBlocks = (workflow as { control?: ControlBlock[] }).control ?? [];
	for (const block of controlBlocks) {
		const resultContext = await executeControlBlock(
			block,
			workflow,
			context,
			{ cwd, timeoutMs: 300_000 },
			logger,
			cliInputs,
		);
		context.failed = resultContext.failed;

		// Count steps in this block
		const blockSteps = (block as { steps: WorkflowStep[] }).steps;
		totalSteps += blockSteps.length;

		// Update passed/failed counts based on the block's results
		for (const step of blockSteps) {
			const output = resultContext.outputs[step.id];
			const wasFailure = !resultContext.outputs[step.id] && resultContext.failed;
			// We'll refine this counting in the final result
		}

		// Use the last block's context for subsequent blocks
		Object.assign(context, resultContext);
	}

	// 5. Execute final steps (sequential, after all control blocks)
	const finalSteps = (workflow as { steps?: WorkflowStep[] }).steps ?? [];
	for (const step of finalSteps) {
		// Resolve inputs for this step
		const stepInputs = resolveInputsForStep(workflow, step, null, cliInputs);

		const stepContext: Context = {
			...context,
			inputs: stepInputs,
		};

		logger.stepStart(step.id, step.type);

		const stepResult = await executeStep(step, stepContext, { cwd, timeoutMs: 300_000 });

		logger.stepEnd(step.id, stepResult);

		totalSteps++;
		if (stepResult.success) {
			passedSteps++;
		} else {
			failedSteps++;
			errors.push({ stepId: step.id, message: stepResult.error ?? "step failed", type: step.type });
		}

		// Update context with step output
		context.outputs = { ...context.outputs, [step.id]: stepResult.output };
		context.previousOutput = stepResult.output;
		if (!stepResult.success) {
			context.failed = true;
		}
	}

	const durationMs = Date.now() - startTime;

	// Count steps in control blocks for the final result
	for (const block of controlBlocks) {
		const blockSteps = (block as { steps: WorkflowStep[] }).steps;
		totalSteps += blockSteps.length;
	}

	// For control block steps, we estimate passed/failed based on context.failed
	// A full implementation would track per-step results through control blocks
	const controlStepCount = totalSteps - finalSteps.length;
	failedSteps += context.failed ? controlStepCount : 0;
	passedSteps = totalSteps - failedSteps;

	const result: WorkflowResult = {
		totalSteps,
		passed: passedSteps,
		failed: failedSteps,
		durationMs,
		errors,
	};

	return result;
}

// ─── Internal helpers ───────────────────────────────────────────────────────

/**
 * Executes a sequence of steps (raw or nested control blocks).
 * Used by controlBlockExecutor for step execution within blocks.
 *
 * @param steps The steps to execute.
 * @param context The execution context.
 * @param options Execution options.
 * @param logger Logger for events.
 * @returns Updated context after all steps.
 */
async function executeSteps(
	steps: WorkflowStep[],
	context: Context,
	options: ExecutionOptions,
	logger: Logger,
): Promise<Context> {
	let resultContext = context;

	for (const step of steps) {
		logger.stepStart(step.id, step.type);

		const stepResult = await executeStep(step, resultContext, options);

		logger.stepEnd(step.id, stepResult);

		// Update context with step output
		resultContext = {
			...resultContext,
			outputs: { ...resultContext.outputs, [step.id]: stepResult.output },
			previousOutput: stepResult.output,
			failed: resultContext.failed || !stepResult.success,
		};
	}

	return resultContext;
}

/**
 * Executes a single control block, dispatching by type.
 *
 * @param block The control block to execute.
 * @param context The execution context.
 * @param options Execution options.
 * @param logger Logger for events.
 * @returns Updated context after execution.
 */
async function executeControlBlock(
	block: ControlBlock,
	workflow: Workflow,
	context: Context,
	options: ExecutionOptions,
	logger: Logger,
	cliInputs: Record<string, string>,
): Promise<Context> {
	logger.blockStart(block.type, block.id);

	let resultContext = context;

	switch (block.type) {
		case "loop_until": {
			resultContext = await loopUntilExecutor(block, workflow, context, options, logger, cliInputs);
			break;
		}
		case "parallel": {
			resultContext = await parallelExecutor(block, workflow, context, options, logger, cliInputs);
			break;
		}
		case "foreach": {
			resultContext = await foreachExecutor(block, workflow, context, options, logger, cliInputs);
			break;
		}
		case "if_else": {
			resultContext = await ifElseExecutor(block, workflow, context, options, logger, cliInputs);
			break;
		}
		case "do_until": {
			resultContext = await doUntilExecutor(block, workflow, context, options, logger, cliInputs);
			break;
		}
		case "do_while": {
			resultContext = await doWhileExecutor(block, workflow, context, options, logger, cliInputs);
			break;
		}
		default: {
			logger.error(`Unknown control block type: ${(block as { type: string }).type}`, "executeControlBlock");
		}
	}

	logger.blockEnd((block as { type: string }).type, block.id);
	return resultContext;
}
