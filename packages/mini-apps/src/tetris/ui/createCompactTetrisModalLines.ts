import type { TetrisGame } from "../game/types.js";
import { padTetrisLine } from "./padTetrisLine.js";
import { padTetrisLines } from "./padTetrisLines.js";
import { renderTetrisBoardBox } from "./renderTetrisBoardBox.js";
import { renderTetrisHotkeysBar } from "./renderTetrisHotkeysBar.js";
import { renderTetrisNextBox } from "./renderTetrisNextBox.js";
import { renderTetrisStatsBox } from "./renderTetrisStatsBox.js";

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
	const statsHeight = Math.min(7, height);
	const nextHeight = Math.min(5, Math.max(0, height - statsHeight));
	const hotkeysHeight = Math.min(5, Math.max(3, height - statsHeight - nextHeight));
	const boardHeight = Math.max(3, height - statsHeight - nextHeight - hotkeysHeight);
	const blocks = [
		...renderTetrisStatsBox(theme, game, Math.min(width, 28), statsHeight, musicPlaying),
		...renderTetrisNextBox(theme, game, Math.min(width, 24), nextHeight),
		...renderTetrisBoardBox(theme, game, width, boardHeight),
		...renderTetrisHotkeysBar(theme, width, hotkeysHeight),
	];
	return padTetrisLines(blocks.map((line) => padTetrisLine(line, width)), height);
}
