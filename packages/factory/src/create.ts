import type { Workflow, WorkflowFile, ValidationError } from "./types.ts";

/**
 * Creates an empty workflow with the given name.
 *
 * @param name — The workflow name (used as the filename stem).
 * @returns A new Workflow ready for steps to be added.
 */
export function createWorkflow(name: string): Workflow {
	return {
		name,
		steps: [],
	};
}

// ─── ID generation ──────────────────────────────────────────────────────────

let _counter = 0;

/**
 * Generates a unique step ID.
 * Uses an incrementing counter so IDs are deterministic and stable across
 * edits (unlike UUIDs which change on every load-save cycle).
 */
function generateId(): string {
	return `step-${++_counter}`;
}

// ─── Adding steps ───────────────────────────────────────────────────────────

/**
 * Appends a step to the workflow's final steps array.
 *
 * @param workflow — The workflow to modify.
 * @param command — The shell command or agent prompt.
 * @param options — Optional type and validation prompt.
 */
export function addStep(
	workflow: Workflow,
	command: string,
	options?: { type?: "bash" | "agent"; validation_prompt?: string; agent?: string },
): Workflow {
	const stepType = options?.type ?? "bash";
	let step: NonNullable<WorkflowFile["steps"]>[number];
	if (stepType === "agent") {
		step = {
			id: generateId(),
			type: "agent",
			agent: options?.agent ?? "nexus",
			command,
		};
	} else {
		step = {
			id: generateId(),
			type: "bash",
			command,
			...(options?.validation_prompt
				? { validation_prompt: options.validation_prompt }
				: {}),
		};
	}
	workflow.steps = workflow.steps ?? [];
	workflow.steps.push(step);
	return workflow;
}

/**
 * Appends a control block to the workflow.
 *
 * @param workflow — The workflow to modify.
 * @param type — Control block type (`loop_until` or `parallel`).
 * @param maxIterations — Maximum iterations (default 3).
 * @param steps — Steps inside this control block.
 */
export function addControlBlock(
	workflow: Workflow,
	type: "loop_until" | "parallel",
	maxIterations: number = 3,
	steps: Array<{
		id: string;
		command: string;
		validation_prompt?: string;
	}>,
): Workflow {
	const controlBlock: NonNullable<WorkflowFile["control"]>[number] = {
		id: generateId(),
		type,
		max_iterations: maxIterations,
		steps: steps.map((s) => ({
			id: s.id,
			type: "bash",
			command: s.command,
			...(s.validation_prompt ? { validation_prompt: s.validation_prompt } : {}),
		})),
	};

	if (!workflow.control) {
		workflow.control = [];
	}
	workflow.control.push(controlBlock);
	return workflow;
}
