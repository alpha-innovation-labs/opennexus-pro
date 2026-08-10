import { canPlacePiece } from "./canPlacePiece";
import type { TetrisActivePiece, TetrisGame } from "./types";

/**
 * Calculates where the active Tetris piece would land after a hard drop.
 *
 * @param game Current game state.
 * @returns Ghost piece placement at the landing row.
 */
export function getGhostPiece(game: TetrisGame): TetrisActivePiece {
	let ghost = { ...game.active, shape: game.active.shape.map((row) => [...row]) };
	while (canPlacePiece(game, { ...ghost, row: ghost.row + 1 })) {
		ghost = { ...ghost, row: ghost.row + 1 };
	}
	return ghost;
}
