/**
 * Input resolver — pure function that resolves inputs according to scoping priority.
 *
 * Resolution order (highest to lowest priority):
 *   1. Step-local inputs
 *   2. Control-level inputs
 *   3. Global inputs
 *
 * CLI arguments override defaults. If no CLI argument is provided,
 * the step's declared `default` is used. If neither exists, the input
 * is `undefined` (template variable stays unresolved, causing a runtime error).
 *
 * @packageDocumentation
 */

import type { Workflow, WorkflowInput, WorkflowStep, ControlBlock } from "../types.js";

/**
 * Resolves inputs for a single step, given the workflow, the step,
 * its containing control block (if any), and CLI overrides.
 *
 * @param workflow The full workflow object.
 * @param step The step being executed.
 * @param controlBlock The containing control block, or null for top-level steps.
 * @param cliInputs CLI-provided input overrides.
 * @returns A record of input name → resolved value.
 */
export function resolveInputsForStep(
	workflow: Workflow,
	step: WorkflowStep,
	controlBlock: ControlBlock | null,
	cliInputs: Record<string, string>,
): Record<string, string | undefined> {
	const result: Record<string, string | undefined> = {};

	// Collect all input definitions in priority order:
	// 1. Step-local inputs (highest priority)
	// 2. Control-level inputs (if within a control block)
	// 3. Global inputs (lowest priority)

	const allInputs: Array<{ name: string; defaultVal?: string }> = [];

	// Step-local inputs
	if (step.inputs) {
		for (const input of step.inputs) {
			allInputs.push({ name: input.name, defaultVal: input.default });
		}
	}

	// Control-level inputs (if applicable)
	if (controlBlock && (controlBlock as { inputs?: WorkflowInput[] }).inputs) {
		for (const input of (controlBlock as { inputs?: WorkflowInput[] }).inputs!) {
			if (!allInputs.find((i) => i.name === input.name)) {
				allInputs.push({ name: input.name, defaultVal: (input as { default?: string }).default });
			}
		}
	}

	// Global inputs (lowest priority)
	if (workflow.inputs) {
		for (const input of workflow.inputs) {
			if (!allInputs.find((i) => i.name === input.name)) {
				allInputs.push({ name: input.name, defaultVal: input.default });
			}
		}
	}

	// Resolve each input: CLI override > default > undefined
	for (const inputDef of allInputs) {
		const key = inputDef.name.replace(/-/g, "_");
		if (cliInputs[key] !== undefined || cliInputs[inputDef.name] !== undefined) {
			result[inputDef.name] = cliInputs[key] ?? cliInputs[inputDef.name];
		} else if ((inputDef as { defaultVal?: string }).defaultVal !== undefined) {
			result[inputDef.name] = (inputDef as { defaultVal?: string }).defaultVal;
		} else {
			result[inputDef.name] = undefined;
		}
	}

	return result;
}
