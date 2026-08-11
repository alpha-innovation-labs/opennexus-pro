import { createTetrisGame } from "./createTetrisGame";
import type { TetrisGame } from "./types";

const session = createTetrisGame();

/**
 * Returns the shared Tetris session resumed by repeated /tetris opens.
 *
 * @returns Shared mutable game state.
 */
export function getTetrisSession(): TetrisGame {
	return session;
}
