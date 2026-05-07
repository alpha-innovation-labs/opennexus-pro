/**
 * Calculates a proportional cell height for the available board area.
 *
 * @param cellWidth Width of one rendered Tetris cell.
 * @returns Height of one rendered Tetris cell.
 */
export function getTetrisCellHeight(cellWidth: number): number {
	return Math.max(1, Math.floor(cellWidth / 2));
}
