import { visibleWidth } from "@earendil-works/pi-tui";
import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";
import type { TetrisGame } from "../game/types";
import { getTetrisHotkeysBoxHeight } from "./getTetrisHotkeysBoxHeight";
import { getTetrisHotkeysBoxWidth } from "./getTetrisHotkeysBoxWidth";
import { padTetrisLine } from "./padTetrisLine";
import { padTetrisLines } from "./padTetrisLines";
import { renderTetrisBoardBox } from "./renderTetrisBoardBox";
import { renderTetrisHotkeysBox } from "./renderTetrisHotkeysBox";
import { renderTetrisNextBox } from "./renderTetrisNextBox";
import { renderTetrisStatsBox } from "./renderTetrisStatsBox";

/**
 * Builds the screenshot-style wide Tetris body with score, board, and right stacked menus.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Inner modal width.
 * @param height Inner modal height.
 * @param musicPlaying Whether music is active.
 * @returns Wide body lines.
 */
export function createWideTetrisModalLines(theme: SharedModalTheme & { bold: (text: string) => string }, game: TetrisGame, width: number, height: number, musicPlaying: boolean): string[] {
	const gap = " ";
	const scoreWidth = 21;
	const rightWidth = Math.max(20, getTetrisHotkeysBoxWidth());
	const fixedWidth = scoreWidth + rightWidth + visibleWidth(gap) * 2;
	const preferredBoardWidth = Math.max(34, Math.floor((game.width * 3 + 2) * 0.85));
	const boardWidth = Math.max(34, Math.min(58, preferredBoardWidth, width - fixedWidth));
	const contentWidth = scoreWidth + boardWidth + rightWidth + visibleWidth(gap) * 2;
	const leftPad = Math.max(0, Math.floor((width - contentWidth) / 2));
	const contentHeight = Math.min(height, game.height + 2);
	const scoreHeight = Math.min(contentHeight, 7);
	const hotkeyHeight = Math.min(contentHeight, getTetrisHotkeysBoxHeight());
	const nextHeight = Math.min(Math.max(0, contentHeight - hotkeyHeight - 1), 6);
	const scoreLines = padTetrisLines(renderTetrisStatsBox(theme, game, scoreWidth, scoreHeight, musicPlaying), contentHeight).map((line) => padTetrisLine(line, scoreWidth));
	const boardLines = padTetrisLines(renderTetrisBoardBox(theme, game, boardWidth, contentHeight), contentHeight).map((line) => padTetrisLine(line, boardWidth));
	const rightLines = padTetrisLines([
		...renderTetrisNextBox(theme, game, rightWidth, nextHeight),
		"",
		...renderTetrisHotkeysBox(theme, rightWidth, hotkeyHeight),
	], contentHeight).map((line) => padTetrisLine(line, rightWidth));
	return Array.from({ length: contentHeight }, (_, index) => padTetrisLine(`${" ".repeat(leftPad)}${scoreLines[index] ?? ""}${gap}${boardLines[index] ?? ""}${gap}${rightLines[index] ?? ""}`, width));
}
