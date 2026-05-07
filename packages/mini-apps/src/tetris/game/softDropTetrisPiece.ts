import { tickTetrisGame } from "./tickTetrisGame.js";
import type { TetrisGame } from "./types.js";

/**
 * Drops the active piece by one row and awards soft-drop score.
 *
 * @param game Current mutable game state.
 */
export function softDropTetrisPiece(game: TetrisGame): void {
	const beforeRow = game.active.row;
	if (tickTetrisGame(game) && game.active.row > beforeRow) game.score += 1;
}
