import type { Task } from "../tool/types.js";
import type { TaskState } from "./state.js";

export type DeleteTasksResult =
	| { state: TaskState; deleted: Array<{ id: number; subject: string }> }
	| { state: TaskState; error: string };

/**
 * Finds duplicate task ids so bulk deletes fail before mutating state.
 */
function findDuplicateId(ids: number[]): number | undefined {
	const seen = new Set<number>();
	for (const id of ids) {
		if (seen.has(id)) return id;
		seen.add(id);
	}
	return undefined;
}

/**
 * Marks one or more tasks as deleted after validating the full id batch first.
 */
export function deleteTasks(state: TaskState, ids: number[], actionLabel: string): DeleteTasksResult {
	if (ids.length === 0) return { state, error: `${actionLabel} requires at least one id` };
	const duplicateId = findDuplicateId(ids);
	if (duplicateId !== undefined) return { state, error: `${actionLabel}.ids contains duplicate #${duplicateId}` };

	const deleted: Array<{ id: number; subject: string }> = [];
	for (const id of ids) {
		const task = state.tasks.find((candidate) => candidate.id === id);
		if (!task) return { state, error: `#${id} not found` };
		if (task.status === "deleted") return { state, error: `#${id} is already deleted` };
		deleted.push({ id, subject: task.subject });
	}

	const idsToDelete = new Set(ids);
	const tasks: Task[] = state.tasks.map((task) => (idsToDelete.has(task.id) ? { ...task, status: "deleted" } : task));
	return { state: { tasks, nextId: state.nextId }, deleted };
}
