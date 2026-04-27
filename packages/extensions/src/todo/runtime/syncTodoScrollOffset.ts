import type { TodoItem } from "../model/types.js";

/**
 * Keeps the selected todo row inside the visible window.
 *
 * @param items Current todo items.
 * @param selectedIndex Active selection index.
 * @param scrollOffset Current scroll offset.
 * @param bodyHeight Visible body height.
 * @returns Safe scroll offset.
 */
export function syncTodoScrollOffset(
	items: TodoItem[],
	selectedIndex: number,
	scrollOffset: number,
	bodyHeight: number,
): number {
	if (selectedIndex < 0) return 0;
	let nextOffset = scrollOffset;
	if (selectedIndex < nextOffset) nextOffset = selectedIndex;
	if (selectedIndex >= nextOffset + bodyHeight) nextOffset = selectedIndex - bodyHeight + 1;
	return Math.max(0, Math.min(nextOffset, Math.max(0, items.length - bodyHeight)));
}
