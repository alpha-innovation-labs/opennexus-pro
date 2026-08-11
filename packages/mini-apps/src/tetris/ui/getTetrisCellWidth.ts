/**
 * Calculates a proportional cell width for the available board area.
 *
 * @param width Available board width including borders.
 * @param height Available board height including borders.
 * @param columns Logical Tetris columns.
 * @param rows Logical Tetris rows.
 * @returns Width of one rendered Tetris cell.
 */
export function getTetrisCellWidth(
	width: number,
	height: number,
	columns: number,
	rows: number,
): number {
	const byWidth = Math.floor(Math.max(1, width - 2) / columns);
	const byHeight = Math.floor(Math.max(1, height - 2) / rows) * 2;
	return Math.max(2, Math.min(byWidth, byHeight));
}
