import type { TetrisGame } from "./types";

/**
 * Locks the active piece into the board.
 *
 * @param game Current mutable game state.
 */
export function mergePiece(game: TetrisGame): void {
	const { active } = game;
	for (let row = 0; row < active.shape.length; row += 1) {
		for (let column = 0; column < active.shape[row]!.length; column += 1) {
			if (!active.shape[row]![column]) continue;
			const boardRow = active.row + row;
			const boardColumn = active.column + column;
			if (boardRow >= 0 && boardRow < game.height) game.board[boardRow]![boardColumn] = active.kind;
		}
	}
}
