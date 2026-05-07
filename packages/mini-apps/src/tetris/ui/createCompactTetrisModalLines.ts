import { visibleWidth } from "@mariozechner/pi-tui";
import type { TetrisGame } from "../game/types.js";
import { padTetrisLine } from "./padTetrisLine.js";
import { padTetrisLines } from "./padTetrisLines.js";
import { renderTetrisBoardBox } from "./renderTetrisBoardBox.js";
import { renderTetrisHotkeysBar } from "./renderTetrisHotkeysBar.js";
import { renderTetrisNextBox } from "./renderTetrisNextBox.js";
import { renderTetrisStatsLineBox } from "./renderTetrisStatsLineBox.js";

/**
 * Builds compact Tetris body lines that keep controls visible on small screens.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Inner modal width.
 * @param height Inner modal height.
 * @param musicPlaying Whether music is active.
 * @returns Compact body lines.
 */
export function createCompactTetrisModalLines(theme: any, game: TetrisGame, width: number, height: number, musicPlaying: boolean): string[] {
	const gap = " ";
	const statsHeight = 3;
	const hotkeysHeight = Math.min(5, Math.max(3, height - statsHeight - 8));
	const middleHeight = Math.max(6, height - statsHeight - hotkeysHeight);
	const nextWidth = Math.min(22, Math.max(16, Math.floor(width * 0.28)));
	const boardWidth = Math.max(24, width - nextWidth - visibleWidth(gap));
	const statsLines = renderTetrisStatsLineBox(theme, game, width, musicPlaying);
	const nextLines = padTetrisLines(renderTetrisNextBox(theme, game, nextWidth, Math.min(6, middleHeight)), middleHeight).map((line) => padTetrisLine(line, nextWidth));
	const boardLines = padTetrisLines(renderTetrisBoardBox(theme, game, boardWidth, middleHeight), middleHeight).map((line) => padTetrisLine(line, boardWidth));
	const middleLines = Array.from({ length: middleHeight }, (_, index) => `${nextLines[index] ?? ""}${gap}${boardLines[index] ?? ""}`);
	const hotkeyLines = renderTetrisHotkeysBar(theme, width, hotkeysHeight);
	return padTetrisLines([...statsLines, ...middleLines, ...hotkeyLines].map((line) => padTetrisLine(line, width)), height);
}
