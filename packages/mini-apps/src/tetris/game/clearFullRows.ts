import type { TetrisCell, TetrisGame } from "./types.js";

const LINE_SCORES = [0, 100, 300, 500, 800] as const;

/**
 * Removes complete rows and updates scoring.
 *
 * @param game Current mutable game state.
 * @returns Number of cleared rows.
 */
export function clearFullRows(game: TetrisGame): number {
	const keptRows = game.board.filter((row) => row.some((cell) => !cell));
	const cleared = game.height - keptRows.length;
	if (cleared === 0) return 0;
	const emptyRows = Array.from({ length: cleared }, () => Array.from<TetrisCell>({ length: game.width }).fill(""));
	game.board = [...emptyRows, ...keptRows];
	game.lines += cleared;
	game.level = Math.floor(game.lines / 10) + 1;
	game.score += (LINE_SCORES[cleared] ?? 0) * game.level;
	return cleared;
}
