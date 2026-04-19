/**
 * Clamps a todo selection index to the available item range.
 *
 * @param index Requested selection index.
 * @param itemCount Total item count.
 * @returns Safe selection index.
 */
export function clampTodoSelection(index: number, itemCount: number): number {
	if (itemCount <= 0) return -1;
	return Math.max(0, Math.min(index, itemCount - 1));
}
