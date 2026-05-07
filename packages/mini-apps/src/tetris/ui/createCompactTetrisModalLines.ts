import type { TetrisGame } from "../game/types.js";
import { getTetrisHotkeysBoxHeight } from "./getTetrisHotkeysBoxHeight.js";
import { getTetrisHotkeysBoxWidth } from "./getTetrisHotkeysBoxWidth.js";
import { padTetrisLine } from "./padTetrisLine.js";
import { padTetrisLines } from "./padTetrisLines.js";
import { renderTetrisBoardBox } from "./renderTetrisBoardBox.js";
import { renderTetrisHotkeysBox } from "./renderTetrisHotkeysBox.js";
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
	const hotkeysHeight = Math.min(height, getTetrisHotkeysBoxHeight());
	const remainingAfterHotkeys = Math.max(0, height - hotkeysHeight);
	const statsHeight = Math.min(4, remainingAfterHotkeys);
	const nextHeight = Math.min(4, Math.max(0, remainingAfterHotkeys - statsHeight));
	const boardHeight = Math.max(3, height - hotkeysHeight - statsHeight - nextHeight);
	const blocks = [
		...renderTetrisStatsBox(theme, game, Math.min(width, 28), statsHeight, musicPlaying),
		...renderTetrisBoardBox(theme, game, width, boardHeight),
		...renderTetrisNextBox(theme, game, Math.min(width, 24), nextHeight),
		...renderTetrisHotkeysBox(theme, Math.min(width, getTetrisHotkeysBoxWidth()), hotkeysHeight),
	];
	return padTetrisLines(blocks.map((line) => padTetrisLine(line, width)), height);
}
