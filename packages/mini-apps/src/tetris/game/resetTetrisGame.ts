import { createTetrisGame } from "./createTetrisGame";
import type { TetrisGame } from "./types";

/**
 * Resets an existing game object while preserving external references.
 *
 * @param game Game state to reset in place.
 */
export function resetTetrisGame(game: TetrisGame): void {
	Object.assign(game, createTetrisGame());
}
