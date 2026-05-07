import type { TetrisGame } from "../game/types.js";
import { padTetrisLine } from "./padTetrisLine.js";
import { padTetrisLines } from "./padTetrisLines.js";
import { renderTetrisBoardBox } from "./renderTetrisBoardBox.js";
import { renderTetrisHotkeysBar } from "./renderTetrisHotkeysBar.js";
import { renderTetrisNextBox } from "./renderTetrisNextBox.js";
import { renderTetrisStatsLineBox } from "./renderTetrisStatsLineBox.js";

/**
 * Builds compact Tetris body lines that keep all critical sections visible on short screens.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Inner modal width.
 * @param height Inner modal height.
 * @param musicPlaying Whether music is active.
 * @returns Compact body lines.
 */
export function createCompactTetrisModalLines(theme: any, game: TetrisGame, width: number, height: number, musicPlaying: boolean): string[] {
	const sectionWidth = Math.min(width, 34);
	const hotkeysHeight = Math.min(5, Math.max(3, height - 6));
	const scoreHeight = height >= 16 ? 7 : Math.min(3, Math.max(0, height - hotkeysHeight));
	const nextHeight = height >= 18 ? Math.min(5, Math.max(0, height - scoreHeight - hotkeysHeight - 3)) : 0;
	const boardHeight = Math.max(0, height - scoreHeight - nextHeight - hotkeysHeight);
	const sections = [
		...renderTetrisStatsLineBox(theme, game, sectionWidth, musicPlaying).slice(0, scoreHeight),
		...renderTetrisNextBox(theme, game, sectionWidth, nextHeight),
		...renderTetrisBoardBox(theme, game, sectionWidth, boardHeight),
		...renderTetrisHotkeysBar(theme, width, hotkeysHeight),
	];
	return padTetrisLines(sections.map((line) => padTetrisLine(line, width)), height).slice(0, height);
}
