import type { TetrisGame } from "../game/types.js";
import { renderScaledTetrisBoard } from "./renderScaledTetrisBoard.js";

/**
 * Renders the main Tetris board without adding a second inner panel border.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Panel width.
 * @param height Panel height.
 * @returns Board panel lines.
 */
export function renderTetrisBoardBox(theme: any, game: TetrisGame, width: number, height: number): string[] {
	return renderScaledTetrisBoard(theme, game, width, height, { title: "Tetris" });
}
