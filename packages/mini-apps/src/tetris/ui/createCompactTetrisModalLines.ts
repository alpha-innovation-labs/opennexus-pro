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
	const statsHeight = 7;
	const nextHeight = Math.min(5, Math.max(0, height - statsHeight - 8));
	const hotkeysHeight = Math.min(6, Math.max(3, height - statsHeight - nextHeight - 8));
	const boardHeight = Math.max(4, height - statsHeight - nextHeight - hotkeysHeight);
	const statsLines = renderTetrisStatsLineBox(theme, game, width, musicPlaying);
	const nextLines = renderTetrisNextBox(theme, game, Math.min(width, 24), nextHeight);
	const boardLines = renderTetrisBoardBox(theme, game, width, boardHeight);
	const hotkeyLines = renderTetrisHotkeysBar(theme, width, hotkeysHeight);
	return padTetrisLines([...statsLines, ...nextLines, ...boardLines, ...hotkeyLines].map((line) => padTetrisLine(line, width)), height);
}
