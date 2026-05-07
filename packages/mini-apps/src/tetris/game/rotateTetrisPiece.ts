import { canPlacePiece } from "./canPlacePiece.js";
import { rotateMatrix } from "./rotateMatrix.js";
import type { TetrisGame } from "./types.js";

/**
 * Rotates the active piece clockwise when the destination is valid.
 *
 * @param game Current mutable game state.
 * @returns True when the piece rotated.
 */
export function rotateTetrisPiece(game: TetrisGame): boolean {
	if (game.gameOver) return false;
	const next = { ...game.active, shape: rotateMatrix(game.active.shape) };
	if (!canPlacePiece(game, next)) return false;
	game.active = next;
	return true;
}
