import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";
import type { TetrisGame } from "../game/types";
import { renderScaledTetrisBoard } from "./renderScaledTetrisBoard";

/**
 * Renders the main Tetris board without adding a second inner panel border.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Panel width.
 * @param height Panel height.
 * @returns Board panel lines.
 */
export function renderTetrisBoardBox(
	theme: SharedModalTheme & { bold: (text: string) => string },
	game: TetrisGame,
	width: number,
	height: number,
): string[] {
	return renderScaledTetrisBoard(theme, game, width, height, {
		title: "Tetris",
	});
}
