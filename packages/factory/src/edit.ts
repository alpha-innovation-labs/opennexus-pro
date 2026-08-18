import type { Workflow, WorkflowFile, WorkflowStep, ValidationError, WorkflowInput, ControlBlock } from "./schema.ts";

// ─── Step editing ───────────────────────────────────────────────────────────

/**
 * Updates a step by its id within the workflow's final steps.
 */
export function editStep(
	workflow: Workflow,
	stepId: string,
	updates: Partial<Pick<WorkflowStep, "command" | "inputs">>,
): void {
	const step = workflow.steps?.find((s) => s.id === stepId);
	if (!step) {
		throw new Error(`Step "${stepId}" not found in workflow "${workflow.name}".`);
	}
	if (updates.command !== undefined) {
		step.command = updates.command;
	}
	if (updates.inputs !== undefined) {
		step.inputs = updates.inputs;
	}
	// validation_prompt: only on bash steps — handled separately
}

/**
 * Updates a bash step's validation_prompt by step id.
 */
export function editStepValidationPrompt(
	workflow: Workflow,
	stepId: string,
	validationPrompt: string | null,
): void {
	const step = workflow.steps?.find((s) => s.id === stepId);
	if (!step) {
		throw new Error(`Step "${stepId}" not found in workflow "${workflow.name}".`);
	}
	if (step.type !== "bash") {
		throw new Error(`Step "${stepId}" is not a bash step; cannot set validation_prompt.`);
	}
	if (validationPrompt === null || validationPrompt === "") {
		delete (step as { validation_prompt?: string }).validation_prompt;
	} else {
		(step as { validation_prompt?: string }).validation_prompt = validationPrompt;
	}
}

/**
 * Removes a step from the workflow's final steps by id.
 */
export function removeStep(workflow: Workflow, stepId: string): void {
	const steps = workflow.steps;
	if (!steps) {
		throw new Error(`Step "${stepId}" not found in workflow "${workflow.name}".`);
	}
	const idx = steps.findIndex((s) => s.id === stepId);
	if (idx === -1) {
		throw new Error(`Step "${stepId}" not found in workflow "${workflow.name}".`);
	}
	steps.splice(idx, 1);
}

// ─── Control block editing ──────────────────────────────────────────────────

/**
 * Updates a control block by its id.
 */
export function editControlBlock(
	workflow: Workflow,
	controlId: string,
	updates: {
		max_iterations?: number;
		type?: string;
		inputs?: WorkflowInput[];
	},
): void {
	const control = workflow.control?.find((c) => c.id === controlId);
	if (!control) {
		throw new Error(
			`Control block "${controlId}" not found in workflow "${workflow.name}".`,
		);
	}
	if (updates.max_iterations !== undefined) {
		(control as { max_iterations?: number }).max_iterations = updates.max_iterations;
	}
	if (updates.type !== undefined) {
		(control as { type?: string }).type = updates.type;
	}
	if (updates.inputs !== undefined) {
		(control as { inputs?: WorkflowInput[] }).inputs = updates.inputs;
	}
}

/**
 * Removes a control block from the workflow by id.
 */
export function removeControlBlock(workflow: Workflow, controlId: string): void {
	if (!workflow.control) {
		throw new Error(
			`Control block "${controlId}" not found in workflow "${workflow.name}".`,
		);
	}
	const idx = workflow.control.findIndex((c) => c.id === controlId);
	if (idx === -1) {
		throw new Error(
			`Control block "${controlId}" not found in workflow "${workflow.name}".`,
		);
	}
	workflow.control.splice(idx, 1);
}

// ─── Step inside control block ──────────────────────────────────────────────

/**
 * Adds a step inside a specific control block.
 */
export function addStepToControl(
	workflow: Workflow,
	controlId: string,
	step: Pick<WorkflowStep, "id" | "type" | "command" | "inputs"> & { type: "bash" | "agent" },
): void {
	const control = workflow.control?.find((c) => c.id === controlId);
	if (!control) {
		throw new Error(
			`Control block "${controlId}" not found in workflow "${workflow.name}".`,
		);
	}
	control.steps.push(step as WorkflowStep);
}

/**
 * Removes a step from within a control block.
 */
export function removeStepFromControl(
	workflow: Workflow,
	controlId: string,
	stepId: string,
): void {
	const control = workflow.control?.find((c) => c.id === controlId);
	if (!control) {
		throw new Error(
			`Control block "${controlId}" not found in workflow "${workflow.name}".`,
		);
	}
	const idx = control.steps.findIndex(
		(s) => "id" in s && s.id === stepId,
	);
	if (idx === -1) {
		throw new Error(`Step "${stepId}" not found in control block "${controlId}".`);
	}
	control.steps.splice(idx, 1);
}

// ─── Workflow-level inputs editing ──────────────────────────────────────────

/**
 * Sets or replaces the workflow's top-level inputs.
 */
export function setWorkflowInputs(
	workflow: Workflow,
	inputs: WorkflowInput[],
): void {
	workflow.inputs = inputs;
}
