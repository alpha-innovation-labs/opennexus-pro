import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";
import type { TetrisGame } from "../game/types";
import { createCompactTetrisModalLines } from "./createCompactTetrisModalLines";
import { createTetrisDividerLine } from "./createTetrisDividerLine";
import { createWideTetrisModalLines } from "./createWideTetrisModalLines";
import { renderScaledTetrisBoard } from "./renderScaledTetrisBoard";
import { renderTetrisHelpLine } from "./renderTetrisHelpLine";
import { renderTetrisStatusLine } from "./renderTetrisStatusLine";

/**
 * Builds full-width Tetris modal body lines.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Inner modal width.
 * @param height Inner modal height available after the shared header.
 * @param musicPlaying Whether music is active.
 * @returns Body lines for the shared modal pane.
 */
export function createTetrisModalLines(
	theme: SharedModalTheme & { bold: (text: string) => string },
	game: TetrisGame,
	width: number,
	height: number,
	musicPlaying = false,
): string[] {
	if (width < 90)
		return createCompactTetrisModalLines(
			theme,
			game,
			width,
			height,
			musicPlaying,
		);
	if (width >= 90)
		return createWideTetrisModalLines(theme, game, width, height, musicPlaying);
	const chromeHeight = 3;
	const boardHeight = Math.max(3, height - chromeHeight);
	return [
		renderTetrisStatusLine(theme, game),
		createTetrisDividerLine(theme, width),
		renderTetrisHelpLine(theme),
		...renderScaledTetrisBoard(theme, game, width, boardHeight),
	].slice(0, height);
}
