import type { TetrisGame } from "./types";

/**
 * Locks the active piece into the board.
 *
 * @param game Current mutable game state.
 */
export function mergePiece(game: TetrisGame): void {
	const { active } = game;
	for (let row = 0; row < active.shape.length; row += 1) {
		const shapeRow = active.shape[row];
		if (!shapeRow) continue;
		for (let column = 0; column < shapeRow.length; column += 1) {
			if (!shapeRow[column]) continue;
			const boardRow = active.row + row;
			const boardColumn = active.column + column;
			if (boardRow >= 0 && boardRow < game.height) {
				const boardRowArr = game.board[boardRow];
				if (boardRowArr) boardRowArr[boardColumn] = active.kind;
			}
		}
	}
}
