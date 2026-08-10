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
		for (let column = 0; column < piece.shape[row]!.length; column += 1) {
			if (!piece.shape[row]![column]) continue;
			const boardRow = piece.row + row;
			const boardColumn = piece.column + column;
			if (boardColumn < 0 || boardColumn >= game.width || boardRow < 0 || boardRow >= game.height) return false;
			if (game.board[boardRow]![boardColumn]) return false;
		}
	}
	return true;
}
