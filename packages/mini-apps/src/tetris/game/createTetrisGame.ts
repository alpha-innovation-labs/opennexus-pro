import { createTetrisPiece, TETRIS_SEQUENCE } from "./tetrominoes";
import type { TetrisCell, TetrisGame } from "./types";

/**
 * Creates a deterministic empty Tetris game.
 *
 * @returns New mutable Tetris game state.
 */
export function createTetrisGame(): TetrisGame {
	const width = 15;
	const height = 20;
	const firstKind = TETRIS_SEQUENCE[0]!;
	return {
		width,
		height,
		board: Array.from({ length: height }, () => Array.from<TetrisCell>({ length: width }).fill("")),
		active: createTetrisPiece(firstKind, width),
		nextKind: TETRIS_SEQUENCE[1]!,
		pieceIndex: 1,
		score: 0,
		lines: 0,
		level: 1,
		gameOver: false,
		paused: false,
	};
}
