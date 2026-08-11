import type { TetrisActivePiece, TetrisGame } from "./types";

/**
 * Checks whether a piece can occupy its current cells on the board.
 *
 * @param game Current game state.
 * @param piece Piece placement to test.
 * @returns True when the piece is inside bounds and does not collide.
 */
export function canPlacePiece(game: TetrisGame, piece: TetrisActivePiece): boolean {
	for (let row = 0; row < piece.shape.length; row += 1) {
		const shapeRow = piece.shape[row];
		if (!shapeRow) continue;
		for (let column = 0; column < shapeRow.length; column += 1) {
			if (!shapeRow[column]) continue;
			const boardRow = piece.row + row;
			const boardColumn = piece.column + column;
			if (boardColumn < 0 || boardColumn >= game.width || boardRow < 0 || boardRow >= game.height) return false;
			const boardRowArr = game.board[boardRow];
			if (boardRowArr?.[boardColumn]) return false;
		}
	}
	return true;
}
