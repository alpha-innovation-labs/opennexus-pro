import { canPlacePiece } from "./canPlacePiece.js";
import { clearFullRows } from "./clearFullRows.js";
import { mergePiece } from "./mergePiece.js";
import { spawnNextPiece } from "./spawnNextPiece.js";
import type { TetrisGame } from "./types.js";

/**
 * Drops the active piece until collision, locks it, and awards score.
 *
 * @param game Current mutable game state.
 */
export function hardDropTetrisPiece(game: TetrisGame): void {
	if (game.gameOver) return;
	let dropped = 0;
	while (canPlacePiece(game, { ...game.active, row: game.active.row + 1 })) {
		game.active = { ...game.active, row: game.active.row + 1 };
		dropped += 1;
	}
	game.score += dropped * 2;
	mergePiece(game);
	clearFullRows(game);
	spawnNextPiece(game);
}
