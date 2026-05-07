import { createTetrisGame } from "./createTetrisGame.js";
import type { TetrisGame } from "./types.js";

const session = createTetrisGame();

/**
 * Returns the shared Tetris session resumed by repeated /tetris opens.
 *
 * @returns Shared mutable game state.
 */
export function getTetrisSession(): TetrisGame {
	return session;
}
