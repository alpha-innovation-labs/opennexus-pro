import type { TodoItem } from "./types.js";

/**
 * Sorts todo items so completed items stay above incomplete items.
 *
 * @param items Todo items to sort.
 * @returns Sorted todo items.
 */
export function sortTodoItems(items: TodoItem[]): TodoItem[] {
	const done = items.filter((item) => item.done);
	const open = items.filter((item) => !item.done);
	return [...done, ...open];
}
