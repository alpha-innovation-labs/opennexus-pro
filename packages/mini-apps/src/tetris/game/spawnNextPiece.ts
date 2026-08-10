import { canPlacePiece } from "./canPlacePiece";
import { createTetrisPiece, TETRIS_SEQUENCE } from "./tetrominoes";
import type { TetrisGame } from "./types";

/**
 * Advances the active piece queue and detects spawn collisions.
 *
 * @param game Current mutable game state.
 */
export function spawnNextPiece(game: TetrisGame): void {
	game.active = createTetrisPiece(game.nextKind, game.width);
	game.pieceIndex = (game.pieceIndex + 1) % TETRIS_SEQUENCE.length;
	game.nextKind = TETRIS_SEQUENCE[game.pieceIndex]!;
	if (!canPlacePiece(game, game.active)) {
		game.gameOver = true;
		game.paused = true;
	}
}
