import { WorkflowFileSchema, type Workflow, type ValidationError, WorkflowStepSchema } from "./schema.ts";

/**
 * Checks for duplicate step IDs across all steps and control blocks.
 */
function checkDuplicateIds(workflow: Workflow): ValidationError[] {
	const errors: ValidationError[] = [];
	const seen = new Map<string, string>(); // id -> first-seen path

	function checkStep(step: { id: string }, path: string): void {
		if (seen.has(step.id)) {
			const first = seen.get(step.id)!;
			errors.push({
				path: `${path}.id`,
				message: `Duplicate id "${step.id}" (first seen at ${first}).`,
				code: "DUPLICATE_STEP_ID",
			});
		} else {
			seen.set(step.id, path);
		}
	}

	// Final steps
	if (workflow.steps) {
		for (let i = 0; i < workflow.steps.length; i++) {
			checkStep(workflow.steps[i], `steps[${i}]`);
		}
	}

	// Steps inside control blocks
	if (workflow.control) {
		for (let i = 0; i < workflow.control.length; i++) {
			const cb = workflow.control[i];
			const cbPath = `control[${i}]`;

			// Control block id itself (optional for some types)
			if (cb.id) {
				if (seen.has(cb.id)) {
					const first = seen.get(cb.id)!;
					errors.push({
						path: `${cbPath}.id`,
						message: `Duplicate id "${cb.id}" (first seen at ${first}).`,
						code: "DUPLICATE_ID",
					});
				} else {
					seen.set(cb.id, cbPath);
				}
			}

			if (cb.steps) {
				for (let j = 0; j < cb.steps.length; j++) {
					checkStep(cb.steps[j], `${cbPath}.steps[${j}]`);
				}
			}
		}
	}

	return errors;
}

/**
 * Validates an entire workflow using the Zod schema, returning all structural errors.
 */
export function validateWorkflow(workflow: Workflow): ValidationError[] {
	const schemaErrors = WorkflowFileSchema.safeParse(workflow);

	const errors: ValidationError[] = [];

	if (!schemaErrors.success) {
		errors.push(
			...schemaErrors.error.issues.map((issue) => ({
				path: issue.path.join(".") || "root",
				message: issue.message,
				code: issue.code,
			})),
		);
	}

	// Cross-step duplicate ID check (not enforced by Zod schema)
	const dupErrors = checkDuplicateIds(workflow);
	errors.push(...dupErrors);

	return errors;
}
