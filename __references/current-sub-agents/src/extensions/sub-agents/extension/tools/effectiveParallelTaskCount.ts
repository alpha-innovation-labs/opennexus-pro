/**
 * Counts top-level parallel tasks after expanding `count` repeats.
 *
 * @param tasks Raw parallel task list.
 * @returns Effective number of task executions.
 */
export function effectiveParallelTaskCount(tasks: Array<{ count?: unknown }> | undefined): number {
	if (!tasks || tasks.length === 0) return 0;

	return tasks.reduce((total, task) => {
		const count = typeof task.count === "number" && Number.isInteger(task.count) && task.count >= 1 ? task.count : 1;
		return total + count;
	}, 0);
}
