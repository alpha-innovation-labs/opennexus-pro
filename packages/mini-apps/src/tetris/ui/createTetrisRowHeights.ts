/**
 * Splits a total render height across Tetris rows while preserving full height.
 *
 * @param totalHeight Available cell content height.
 * @param rowCount Number of Tetris rows.
 * @returns Per-row segment heights.
 */
export function createTetrisRowHeights(totalHeight: number, rowCount: number): number[] {
	const baseHeight = Math.max(0, Math.floor(totalHeight / rowCount));
	let remaining = Math.max(0, totalHeight - baseHeight * rowCount);
	return Array.from({ length: rowCount }, () => {
		const extra = remaining > 0 ? 1 : 0;
		remaining -= extra;
		return baseHeight + extra;
	});
}
