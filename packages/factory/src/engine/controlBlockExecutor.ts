/**
 * Control block executor — handles all control block types.
 *
 * Control blocks group steps into loops, parallel executions, conditionals, etc.
 * They receive a reference to the workflow so they can resolve per-step inputs.
 *
 * Supported block types:
 * - `loop_until` — retry until condition met
 * - `parallel` — concurrent step execution
 * - `foreach` — iterate over a list
 * - `if_else` — conditional step selection
 * - `do_until` — execute until condition met (post-check)
 * - `do_while` — execute while condition holds (pre-check)
 */

import type { Workflow } from "../schema.ts";
import type { Context, ExecutionOptions, Logger } from "./types.ts";
import type { ControlBlock, WorkflowStep } from "../schema.ts";

import { templateResolver } from "./templateResolver.ts";
import {
	executeStep,
	updateContext,
} from "./stepExecutor.ts";
import { resolveInputsForStep } from "./inputResolver.ts";
import { splitPaneRight } from "@nexus/herdr";

// ─── Public executor functions ──────────────────────────────────────────────

export function loopUntilExecutor(
	block: Extract<ControlBlock, { type: "loop_until" }>,
	workflow: Workflow,
	context: Context,
	options: ExecutionOptions,
	logger: Logger,
	cliInputs: Record<string, string>,
): Promise<Context> {
	return executeControlBlock(block, workflow, context, options, logger, cliInputs);
}

// ─── Parallel executor ──────────────────────────────────────────────────────

export function parallelExecutor(
	block: Extract<ControlBlock, { type: "parallel" }>,
	workflow: Workflow,
	context: Context,
	options: ExecutionOptions,
	logger: Logger,
	cliInputs: Record<string, string>,
): Promise<Context> {
	return executeControlBlock(block, workflow, context, options, logger, cliInputs);
}

// ─── Foreach executor ───────────────────────────────────────────────────────

export function foreachExecutor(
	block: Extract<ControlBlock, { type: "foreach" }>,
	workflow: Workflow,
	context: Context,
	options: ExecutionOptions,
	logger: Logger,
	cliInputs: Record<string, string>,
): Promise<Context> {
	return executeControlBlock(block, workflow, context, options, logger, cliInputs);
}

// ─── If / Else executor ─────────────────────────────────────────────────────

export function ifElseExecutor(
	block: Extract<ControlBlock, { type: "if_else" }>,
	workflow: Workflow,
	context: Context,
	options: ExecutionOptions,
	logger: Logger,
	cliInputs: Record<string, string>,
): Promise<Context> {
	return executeControlBlock(block, workflow, context, options, logger, cliInputs);
}

// ─── Do Until executor ──────────────────────────────────────────────────────

export function doUntilExecutor(
	block: Extract<ControlBlock, { type: "do_until" }>,
	workflow: Workflow,
	context: Context,
	options: ExecutionOptions,
	logger: Logger,
	cliInputs: Record<string, string>,
): Promise<Context> {
	return executeControlBlock(block, workflow, context, options, logger, cliInputs);
}

// ─── Do While executor ──────────────────────────────────────────────────────

export function doWhileExecutor(
	block: Extract<ControlBlock, { type: "do_while" }>,
	workflow: Workflow,
	context: Context,
	options: ExecutionOptions,
	logger: Logger,
	cliInputs: Record<string, string>,
): Promise<Context> {
	return executeControlBlock(block, workflow, context, options, logger, cliInputs);
}

// ─── Shared control block execution ─────────────────────────────────────────

/**
 * Internal: executes any control block type.
 *
 * @param block The control block to execute.
 * @param workflow Reference to the full workflow (for input resolution).
 * @param context The execution context.
 * @param options Execution options.
 * @param logger Logger for events.
 * @param cliInputs CLI-provided input overrides.
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

	const maxIterations = (block as { max_iterations?: number }).max_iterations ?? 3;
	const steps = (block as { steps: WorkflowStep[] }).steps;

	let resultContext = context;

	// Resolve inputs for each step (from control-level + global + CLI)
	const resolvedStepInputs = steps.map((step) =>
		resolveInputsForStep(workflow, step, block, cliInputs),
	);

	if (block.type === "parallel") {
		// Execute all steps concurrently, fail fast on first error.
		// Pre-split a unique pane for each parallel step so they don't collide
		// when splitting from the same root pane simultaneously.
		const basePane = resultContext._paneId;
		const stepPromises = steps.map(async (step, idx) => {
			try {
				const stepInputs = resolvedStepInputs[idx];
				// Pre-split a unique pane for this parallel step.
				const splitPane = splitPaneRight(basePane);
				const stepContext: Context = {
					...resultContext,
					inputs: stepInputs,
					_paneId: splitPane,
				};
				const stepResult = await executeStep(step, stepContext, options);
				return { step, result: stepResult };
			} catch (err) {
				return { step, result: { success: false, output: null, validationPassed: null, error: err instanceof Error ? err.message : "unknown"} };
			}
		});

		const stepResults = await Promise.all(stepPromises);

		// Always update context with all step results (successful or not),
		// so downstream steps can reference outputs from any step.
		for (const sr of stepResults) {
			resultContext = updateContext(resultContext, sr.step, sr.result);
		}

		// Mark the block as failed if any step failed.
		if (stepResults.some((sr) => !sr.result.success)) {
			const firstFailure = stepResults.find((sr) => !sr.result.success);
			if (firstFailure) {
				logger.error(firstFailure.result.error ?? "step failed", `${block.type}[${block.id}]`);
			}
			resultContext.failed = true;
		}
	} else if (block.type === "foreach") {
		const itemsBlock = block as Extract<ControlBlock, { type: "foreach" }>;
		const itemsExpr = itemsBlock.items;
		const inputVar = itemsBlock.input_var ?? "item";

		const itemsStr = templateResolver(itemsExpr, {
			outputs: resultContext.outputs,
			previousOutput: resultContext.previousOutput,
			inputs: resultContext.inputs,
		});

		const items = itemsStr
			.split(/[\s,]+/)
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const iterationContext: Context = {
				...resultContext,
				item,
				previousOutput: null,
				iteration: i,
			};

			for (let s = 0; s < steps.length; s++) {
				const step = steps[s];
				const stepInputs = resolvedStepInputs[s];
				iterationContext.inputs = stepInputs;
				iterationContext.inputs[inputVar] = item;

				logger.stepStart(step.id, step.type);
				const stepResult = await executeStep(step, iterationContext, options);
				logger.stepEnd(step.id, stepResult);

				resultContext = updateContext(resultContext, step, stepResult);
			}
		}
	} else if (block.type === "if_else") {
		const ifBlock = block as Extract<ControlBlock, { type: "if_else" }>;
		const conditionMet = evaluateCondition(ifBlock.condition, resultContext);

		const stepsToRun = conditionMet ? ifBlock.steps : (ifBlock.other_steps ?? []);
		for (let s = 0; s < stepsToRun.length; s++) {
			const step = stepsToRun[s];
			const stepInputs = resolvedStepInputs[s] ?? resolveInputsForStep(workflow, step, block, cliInputs);
			const stepContext: Context = { ...resultContext, inputs: stepInputs };

			logger.stepStart(step.id, step.type);
			const stepResult = await executeStep(step, stepContext, options);
			logger.stepEnd(step.id, stepResult);

			resultContext = updateContext(resultContext, step, stepResult);
		}
	} else {
		// Loop modes: loop_until, do_until, do_while — sequential retries
		let iteration = 0;
		let done = false;

		while (!done && iteration < maxIterations) {
			iteration++;

			for (let s = 0; s < steps.length; s++) {
				const step = steps[s];
				const stepInputs = resolvedStepInputs[s];
				const stepContext: Context = { ...resultContext, inputs: stepInputs };

				logger.stepStart(step.id, step.type);
				const stepResult = await executeStep(step, stepContext, options);
				logger.stepEnd(step.id, stepResult);

				resultContext = updateContext(resultContext, step, stepResult);

				if (!stepResult.success) {
					logger.error(stepResult.error ?? "step failed", `${block.type}[${block.id}] iteration ${iteration}`);
					resultContext.failed = true;
				}

				// Check conditions for do_until / do_while
				if (block.type === "do_until" || block.type === "do_while") {
					const condBlock = block as Extract<ControlBlock, { type: "do_until" | "do_while" }>;
					if (condBlock.condition) {
						const condResult = evaluateCondition(condBlock.condition, resultContext);
						if (block.type === "do_until" ? condResult : !condResult) {
							done = true;
							break;
						}
					}
				}
			}
		}

		if (!done && iteration >= maxIterations) {
			logger.error(`Max iterations (${maxIterations}) reached`, `${block.type}[${block.id}]`);
		}
	}

	logger.blockEnd(block.type, block.id);
	return resultContext;
}

// ─── Condition evaluation ────────────────────────────────────────────────────

/**
 * Evaluates a control block condition against the current context.
 */
export function evaluateCondition(
	condition: string | undefined,
	context: Context,
): boolean {
	if (!condition) return true;

	const resolved = templateResolver(condition, {
		outputs: context.outputs,
		previousOutput: context.previousOutput,
		inputs: context.inputs,
	});

	// Simple truthy check: "true", "yes", "1", non-empty strings
	const truthyValues = ["true", "yes", "1", "ok", "pass", "success"];
	return truthyValues.includes(resolved.toLowerCase().trim()) || (resolved.trim().length > 0 && resolved !== "false" && resolved !== "0" && resolved !== "no");
}
