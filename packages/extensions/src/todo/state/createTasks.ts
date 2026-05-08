import type { BulkCreateTaskInput, Task } from "../tool/types.js";
import type { TaskState } from "./state.js";

export type CreateTasksResult =
	| { state: TaskState; taskIds: number[] }
	| { state: TaskState; error: string };

/**
 * Validates a create input subject and returns a stable reducer error when it is missing.
 */
function validateSubject(input: BulkCreateTaskInput, label: string): string | undefined {
	if (input.subject?.trim()) return undefined;
	return label === "create" ? "subject required for create" : `${label}.subject required`;
}

/**
 * Validates that every blockedBy reference points at an existing, non-deleted task.
 */
function validateBlockedBy(state: TaskState, blockedBy: number[] | undefined, fieldName: string): string | undefined {
	if (!blockedBy?.length) return undefined;
	for (const dep of blockedBy) {
		const depTask = state.tasks.find((task) => task.id === dep);
		if (!depTask) return `${fieldName}: #${dep} not found`;
		if (depTask.status === "deleted") return `${fieldName}: #${dep} is deleted`;
	}
	return undefined;
}

/**
 * Builds a pending task from a validated create input and assigned task id.
 */
function buildPendingTask(id: number, input: BulkCreateTaskInput): Task {
	const task: Task = { id, subject: input.subject, status: "pending" };
	if (input.description) task.description = input.description;
	if (input.activeForm) task.activeForm = input.activeForm;
	if (input.blockedBy?.length) task.blockedBy = [...input.blockedBy];
	if (input.owner) task.owner = input.owner;
	if (input.metadata) task.metadata = { ...input.metadata };
	return task;
}

/**
 * Creates one or more pending tasks after validating the full batch first.
 */
export function createTasks(state: TaskState, inputs: BulkCreateTaskInput[], actionLabel: string): CreateTasksResult {
	if (inputs.length === 0) return { state, error: `${actionLabel} requires at least one item` };
	for (const [index, input] of inputs.entries()) {
		const label = inputs.length === 1 ? actionLabel : `${actionLabel}.items[${index}]`;
		const blockedByField = label === "create" ? "blockedBy" : `${label}.blockedBy`;
		const subjectError = validateSubject(input, label);
		if (subjectError) return { state, error: subjectError };
		const blockedByError = validateBlockedBy(state, input.blockedBy, blockedByField);
		if (blockedByError) return { state, error: blockedByError };
	}

	const taskIds: number[] = [];
	const tasks = [...state.tasks];
	let nextId = state.nextId;
	for (const input of inputs) {
		taskIds.push(nextId);
		tasks.push(buildPendingTask(nextId, input));
		nextId += 1;
	}
	return { state: { tasks, nextId }, taskIds };
}
