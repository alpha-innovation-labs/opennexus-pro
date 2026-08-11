import type { TetrisCell, TetrisGame } from "./types";

/**
 * Builds a board snapshot including the active falling piece.
 *
 * @param game Current game state.
 * @returns Visible board cells.
 */
export function getTetrisCells(game: TetrisGame): TetrisCell[][] {
	const cells = game.board.map((row) => [...row]);
	for (let row = 0; row < game.active.shape.length; row += 1) {
		const shapeRow = game.active.shape[row];
		if (!shapeRow) continue;
		for (let column = 0; column < shapeRow.length; column += 1) {
			if (!shapeRow[column]) continue;
			const boardRow = game.active.row + row;
			const boardColumn = game.active.column + column;
			if (boardRow >= 0 && boardRow < game.height) {
				const boardRowArr = cells[boardRow];
				if (boardRowArr) boardRowArr[boardColumn] = game.active.kind;
			}
		}
	}
	return cells;
}
