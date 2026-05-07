import { createTetrisGame } from "./createTetrisGame.js";
import type { TetrisGame } from "./types.js";

/**
 * Resets an existing game object while preserving external references.
 *
 * @param game Game state to reset in place.
 */
export function resetTetrisGame(game: TetrisGame): void {
	Object.assign(game, createTetrisGame());
}
