/**
 * Step executor — dispatches execution by step type (bash or agent).
 *
 * Each step type has its own executor implementation. Both receive the
 * context and return a StepResult. Each knows only its step type.
 *
 * @packageDocumentation
 */

import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { WorkflowStep } from "../types.ts";
import type { Context, StepResult, ExecutionOptions } from "./types.ts";

import { runCommandInPane, readPaneOutput } from "@nexus/herdr";
import {
	startHerdrAgent,
	startHerdrAgentAsync,
	promptHerdrAgent,
	promptHerdrAgentAsync,
	waitAgent,
	readAgentOutput,
	stopAgent,
	splitPaneRight,
} from "@nexus/herdr";
import { templateResolver } from "./templateResolver.ts";

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

	// Use the root pane directly for the first step (when _paneId === _rootPaneId)
	// to avoid creating a dead root pane. Subsequent steps split from the new pane.
	const paneId =
		context._rootPaneId && context._paneId === context._rootPaneId
			? context._paneId
			: splitPaneRight(context._paneId);

	// When the resolved command is large (multi-line or > 4KB), write it to a
	// temp script file and execute that instead of passing it as a CLI argument.
	// This avoids shell argument truncation when the command contains large
	// interpolated outputs (e.g. <output:stepId> with multi-line content).
	const LARGE_COMMAND_THRESHOLD = 4096;
	let scriptPath: string | null = null;
	let effectiveCommand: string;

	if (resolvedCommand.length > LARGE_COMMAND_THRESHOLD || resolvedCommand.includes("\n")) {
		const tmpDir = mkdtempSync(join(tmpdir(), "factory-"));
		scriptPath = join(tmpDir, "script.sh");
		writeFileSync(scriptPath, resolvedCommand, "utf-8");
		effectiveCommand = `bash ${scriptPath}`;
	} else {
		effectiveCommand = resolvedCommand;
	}

	try {
		const result = runCommandInPane(paneId, effectiveCommand, {
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
	} finally {
		// Clean up temp script file if created
		if (scriptPath) {
			try {
				rmSync(scriptPath);
			} catch {
				// Ignore cleanup errors
			}
		}
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

	// Use the root pane directly for the first step (when _paneId === _rootPaneId)
	// to avoid creating a dead root pane. Subsequent steps split from the new pane.
	const paneId =
		context._rootPaneId && context._paneId === context._rootPaneId
			? context._paneId
			: splitPaneRight(context._paneId);

	try {
		// Start an agent in the pane (async — allows parallel agents to start concurrently)
		const agentName = await startHerdrAgentAsync(paneId, {
			maxWaitSeconds: (options.timeoutMs ?? 120_000) / 1000,
			kind: step.agent,
		});

		// Prompt the agent and wait for it to settle (async — allows parallel agents to be prompted concurrently)
		await promptHerdrAgentAsync(agentName, resolvedCommand, {
			timeoutMs: options.timeoutMs ?? 120_000,
		});

		// Wait for the agent to reach idle (non-blocking, allows parallel agents to run concurrently)
		await waitAgent(agentName, { status: "idle", timeoutMs: options.timeoutMs ?? 120_000 });

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
