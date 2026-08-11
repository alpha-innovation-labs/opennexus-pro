import { getGhostPiece } from "./getGhostPiece";
import type { TetrisCell, TetrisGame } from "./types";

/** Tetris render cell with optional ghost projection marker. */
export type TetrisRenderCell = TetrisCell | "ghost";

/**
 * Builds a board snapshot with the ghost projection and active falling piece.
 *
 * @param game Current game state.
 * @returns Visible board cells plus ghost markers.
 */
export function getTetrisRenderCells(game: TetrisGame): TetrisRenderCell[][] {
	const cells: TetrisRenderCell[][] = game.board.map((row) => [...row]);
	applyPiece(cells, game, getGhostPiece(game), "ghost", false);
	applyPiece(cells, game, game.active, game.active.kind, true);
	return cells;
}

/**
 * Applies one piece to a render-cell board.
 *
 * @param cells Mutable render-cell board.
 * @param game Current game state.
 * @param piece Piece placement to draw.
 * @param value Cell value to write.
 * @param overwrite Whether to replace existing render cells.
 */
function applyPiece(cells: TetrisRenderCell[][], game: TetrisGame, piece: { shape: number[][]; row: number; column: number }, value: TetrisRenderCell, overwrite: boolean): void {
	for (let row = 0; row < piece.shape.length; row += 1) {
		const shapeRow = piece.shape[row];
		if (!shapeRow) continue;
		for (let column = 0; column < shapeRow.length; column += 1) {
			if (!shapeRow[column]) continue;
			const boardRow = piece.row + row;
			const boardColumn = piece.column + column;
			if (boardRow < 0 || boardRow >= game.height) continue;
			const boardRowArr = cells[boardRow];
			if (!overwrite && boardRowArr && boardRowArr[boardColumn]) continue;
			if (boardRowArr) boardRowArr[boardColumn] = value;
		}
	}
}
