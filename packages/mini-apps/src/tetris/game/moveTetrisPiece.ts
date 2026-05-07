import { canPlacePiece } from "./canPlacePiece.js";
import type { TetrisGame } from "./types.js";

/**
 * Moves the active piece horizontally when the destination is valid.
 *
 * @param game Current mutable game state.
 * @param deltaColumn Horizontal movement delta.
 * @returns True when the piece moved.
 */
export function moveTetrisPiece(game: TetrisGame, deltaColumn: number): boolean {
	if (game.gameOver) return false;
	const next = { ...game.active, column: game.active.column + deltaColumn };
	if (!canPlacePiece(game, next)) return false;
	game.active = next;
	return true;
}
