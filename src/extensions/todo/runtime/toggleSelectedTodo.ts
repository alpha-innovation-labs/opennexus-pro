import type { TodoItem } from "../model/types.js";
import { sortTodoItems } from "../model/sortTodoItems.js";

/**
 * Toggles completion for the selected todo and re-sorts the list.
 *
 * @param items Current todo items.
 * @param selectedIndex Current selection index.
 * @returns Updated items and selection.
 */
export function toggleSelectedTodo(
	items: TodoItem[],
	selectedIndex: number,
): { items: TodoItem[]; selectedIndex: number } {
	const item = items[selectedIndex];
	if (!item) return { items, selectedIndex };
	const updatedItem = { ...item, done: !item.done, updatedAt: Date.now() };
	const nextItems = sortTodoItems(items.map((candidate) => candidate.id === item.id ? updatedItem : candidate));
	return {
		items: nextItems,
		selectedIndex: nextItems.findIndex((candidate) => candidate.id === item.id),
	};
}
