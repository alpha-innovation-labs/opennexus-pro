import { canPlacePiece } from "./canPlacePiece";
import { clearFullRows } from "./clearFullRows";
import { mergePiece } from "./mergePiece";
import { spawnNextPiece } from "./spawnNextPiece";
import type { TetrisGame } from "./types";

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
