/**
 * Splits a total render width across Tetris columns while preserving full width.
 *
 * @param totalWidth Available cell content width.
 * @param columnCount Number of Tetris columns.
 * @returns Per-column segment widths.
 */
export function createTetrisSegmentWidths(
	totalWidth: number,
	columnCount: number,
): number[] {
	const baseWidth = Math.max(1, Math.floor(totalWidth / columnCount));
	let remaining = Math.max(0, totalWidth - baseWidth * columnCount);
	return Array.from({ length: columnCount }, () => {
		const extra = remaining > 0 ? 1 : 0;
		remaining -= extra;
		return baseWidth + extra;
	});
}
