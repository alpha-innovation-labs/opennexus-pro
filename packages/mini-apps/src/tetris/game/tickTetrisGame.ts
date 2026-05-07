import { canPlacePiece } from "./canPlacePiece.js";
import { clearFullRows } from "./clearFullRows.js";
import { mergePiece } from "./mergePiece.js";
import { spawnNextPiece } from "./spawnNextPiece.js";
import type { TetrisGame } from "./types.js";

/**
 * Advances gravity by one row or locks the active piece.
 *
 * @param game Current mutable game state.
 * @returns True when the visible game changed.
 */
export function tickTetrisGame(game: TetrisGame): boolean {
	if (game.paused || game.gameOver) return false;
	const next = { ...game.active, row: game.active.row + 1 };
	if (canPlacePiece(game, next)) {
		game.active = next;
		return true;
	}
	mergePiece(game);
	clearFullRows(game);
	spawnNextPiece(game);
	return true;
}
