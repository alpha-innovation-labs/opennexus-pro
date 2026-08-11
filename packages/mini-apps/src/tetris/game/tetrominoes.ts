import type { TetrisActivePiece, TetrisCell } from "./types";

/** Deterministic tetromino sequence used for reproducible gameplay and tests. */
export const TETRIS_SEQUENCE: Array<Exclude<TetrisCell, "">> = ["I", "O", "T", "S", "Z", "J", "L"];

/** Tetromino shape matrices keyed by piece kind. */
export const TETROMINOES: Record<Exclude<TetrisCell, "">, number[][]> = {
	I: [[1, 1, 1, 1]],
	O: [[1, 1], [1, 1]],
	T: [[0, 1, 0], [1, 1, 1]],
	S: [[0, 1, 1], [1, 1, 0]],
	Z: [[1, 1, 0], [0, 1, 1]],
	J: [[1, 0, 0], [1, 1, 1]],
	L: [[0, 0, 1], [1, 1, 1]],
};

/**
 * Creates an active piece centered near the top of the board.
 *
 * @param kind Tetromino kind to spawn.
 * @param boardWidth Playfield width.
 * @returns Active piece state.
 */
export function createTetrisPiece(kind: Exclude<TetrisCell, "">, boardWidth: number): TetrisActivePiece {
	const shape = TETROMINOES[kind].map((row) => [...row]);
	const firstRow = shape[0];
	return { kind, shape, row: 0, column: firstRow ? Math.floor((boardWidth - firstRow.length) / 2) : 0 };
}
