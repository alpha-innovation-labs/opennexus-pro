import { clampTodoSelection } from "./clampTodoSelection.js";
import type { TodoItem } from "../model/types.js";

/**
 * Removes the selected todo item from the list.
 *
 * @param items Current todo items.
 * @param selectedIndex Current selection index.
 * @param editingId Current editing item id.
 * @returns Updated todo deletion result.
 */
export function deleteSelectedTodo(
	items: TodoItem[],
	selectedIndex: number,
	editingId: string | null,
): { items: TodoItem[]; selectedIndex: number; editingId: string | null } {
	const item = items[selectedIndex];
	if (!item) return { items, selectedIndex, editingId };
	const nextItems = items.filter((candidate) => candidate.id !== item.id);
	return {
		items: nextItems,
		selectedIndex: clampTodoSelection(selectedIndex, nextItems.length),
		editingId: item.id === editingId ? null : editingId,
	};
}
