import type { Workflow, WorkflowFile, WorkflowStep, ValidationError } from "./types.js";

/**
 * Filters for `findNodes`.
 */
export type NodeFilter =
	| { type: "byId"; id: string }
	| { type: "byType"; stepType: "bash" | "agent" }
	| { type: "predicate"; predicate: (step: WorkflowStep) => boolean };

/**
 * Finds all steps matching the given filter across final steps
 * and all control blocks.
 */
export function findNodes(
	workflow: Workflow,
	filter: NodeFilter,
): WorkflowStep[] {
	const results: WorkflowStep[] = [];

	const matches = (step: WorkflowStep): boolean => {
		switch (filter.type) {
			case "byId":
				return step.id === filter.id;
			case "byType":
				return step.type === filter.stepType;
			case "predicate":
				return filter.predicate(step);
		}
	};

	// Search final steps
	if (workflow.steps) {
		for (const step of workflow.steps) {
			if (matches(step)) {
				results.push(step);
			}
		}
	}

	// Search inside control blocks
	if (workflow.control) {
		for (const control of workflow.control) {
			for (const step of control.steps) {
				if (matches(step)) {
					results.push(step);
				}
			}
		}
	}

	return results;
}

/**
 * Performs a depth-first traversal of all steps (final + inside control blocks).
 */
export function walkWorkflow(
	workflow: Workflow,
	visitor: (step: WorkflowStep, context: { controlBlockId?: string }) => void,
): void {
	// Final steps
	if (workflow.steps) {
		for (const step of workflow.steps) {
			visitor(step, {});
		}
	}

	// Steps inside control blocks
	if (workflow.control) {
		for (const control of workflow.control) {
			for (const step of control.steps) {
				visitor(step, { controlBlockId: control.id });
			}
		}
	}
}
