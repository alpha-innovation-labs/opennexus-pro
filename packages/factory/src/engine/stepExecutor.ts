/**
 * Step executor — dispatches execution by step type (bash or agent).
 *
 * Each step type has its own executor implementation. Both receive the
 * context and return a StepResult. Each knows only its step type.
 *
 * @packageDocumentation
 */

import type { WorkflowStep } from "../types.js";
import type { Context, StepResult, ExecutionOptions } from "./types.js";

import { runCommandInPane, readPaneOutput } from "@nexus/herdr";
import {
	startHerdrAgent,
	promptHerdrAgent,
	waitAgent,
	readAgentOutput,
	stopAgent,
	splitPaneRight,
} from "@nexus/herdr";
import { templateResolver } from "./templateResolver.js";

// ─── Bash executor ──────────────────────────────────────────────────────────

async function bashStep(
	step: Extract<WorkflowStep, { type: "bash" }>,
	context: Context,
	options: ExecutionOptions,
): Promise<StepResult> {
	// Resolve the command template
	const resolvedCommand = templateResolver(step.command, {
		outputs: context.outputs,
		previousOutput: context.previousOutput,
		inputs: context.inputs,
		item: context.item,
	});

	// Split a new pane for this step
	const paneId = splitPaneRight();

	try {
		const result = runCommandInPane(paneId, resolvedCommand, {
			timeoutMs: options.timeoutMs ?? 30_000,
		});

		const validationPassed = step.validation_prompt
			? validateOutput(result.output, step.validation_prompt)
			: null;

		return {
			success: result.success,
			output: result.output || null,
			validationPassed,
			error: result.error ?? (result.success ? null : "command failed"),
		};
	} catch (err) {
		return {
			success: false,
			output: null,
			validationPassed: null,
			error: err instanceof Error ? err.message : "unknown bash error",
		};
	}
}

// ─── Agent executor ─────────────────────────────────────────────────────────

async function agentStep(
	step: Extract<WorkflowStep, { type: "agent" }>,
	context: Context,
	options: ExecutionOptions,
): Promise<StepResult> {
	// Resolve the command template
	const resolvedCommand = templateResolver(step.command, {
		outputs: context.outputs,
		previousOutput: context.previousOutput,
		inputs: context.inputs,
		item: context.item,
	});

	// Split a new pane for this step, then start an agent in it
	const paneId = splitPaneRight();

	try {
		// Start an agent in the pane
		const agentName = startHerdrAgent(paneId, {
			maxWaitSeconds: (options.timeoutMs ?? 120_000) / 1000,
		});

		// Prompt the agent and wait for it to settle
		promptHerdrAgent(agentName, resolvedCommand, {
			timeoutMs: options.timeoutMs ?? 120_000,
		});

		// Wait for the agent to reach idle
		waitAgent(agentName, { status: "idle", timeoutMs: options.timeoutMs ?? 120_000 });

		// Read the agent's output
		const outputResult = readAgentOutput(agentName, { lines: 200 });

		return {
			success: true,
			output: outputResult._raw || null,
			validationPassed: null, // agent steps don't have validation
			error: null,
		};
	} catch (err) {
		return {
			success: false,
			output: null,
			validationPassed: null,
			error: err instanceof Error ? err.message : "unknown agent error",
		};
	}
}

// ─── Validation helper ──────────────────────────────────────────────────────

function validateOutput(output: string, validationPrompt: string): boolean {
	// Simple heuristic: check if the output contains key phrases from
	// the validation prompt. A full implementation would delegate to an agent.
	const lowerOutput = output.toLowerCase();
	const lowerPrompt = validationPrompt.toLowerCase();

	// If the validation prompt is short (≤ 5 words), treat it as a required substring.
	const words = lowerPrompt.split(/\s+/).filter((w) => w.length > 2);
	if (words.length <= 5) {
		return words.every((word) => lowerOutput.includes(word));
	}

	// For longer prompts, just check that the output is non-empty.
	return output.trim().length > 0;
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

/**
 * Executes a single workflow step (bash or agent) and returns the result.
 *
 * @param step The workflow step to execute.
 * @param context The execution context (includes _paneId for pane management).
 * @param options Execution options (timeout, cwd).
 * @returns The step result.
 */
export async function executeStep(
	step: WorkflowStep,
	context: Context,
	options: ExecutionOptions,
): Promise<StepResult> {
	if (step.type === "bash") {
		return bashStep(step as Extract<WorkflowStep, { type: "bash" }>, context, options);
	}

	if (step.type === "agent") {
		return agentStep(step as Extract<WorkflowStep, { type: "agent" }>, context, options);
	}

	throw new Error(`Unknown step type: ${(step as { type: string }).type}`);
}

// ─── Context update helper ───────────────────────────────────────────────────

/**
 * Updates the execution context with a step's result.
 *
 * @param context The current context.
 * @param step The step that was executed.
 * @param result The step's result.
 * @returns Updated context.
 */
export function updateContext(
	context: Context,
	step: WorkflowStep,
	result: StepResult,
): Context {
	return {
		...context,
		previousOutput: result.output,
		outputs: {
			...context.outputs,
			[step.id]: result.output,
		},
		failed: context.failed || !result.success,
	};
}
