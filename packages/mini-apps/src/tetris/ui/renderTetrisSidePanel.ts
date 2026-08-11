import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";
import type { TetrisGame } from "../game/types";
import { createTetrisDividerLine } from "./createTetrisDividerLine";
import { renderTetrisHelpLine } from "./renderTetrisHelpLine";

/**
 * Renders the wide-layout Tetris score and controls side panel.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Panel width.
 * @param musicPlaying Whether music is currently playing.
 * @returns Side-panel lines.
 */
export function renderTetrisSidePanel(theme: SharedModalTheme & { bold: (text: string) => string }, game: TetrisGame, width: number, musicPlaying: boolean): string[] {
	const status = game.gameOver ? "Game Over" : game.paused ? "Paused" : "Playing";
	const music = musicPlaying ? "On" : "Off";
	return [
		theme.fg("accent", theme.bold("Stats")),
		createTetrisDividerLine(theme, width),
		`${theme.bold("Score")} ${game.score}`,
		`${theme.bold("Lines")} ${game.lines}`,
		`${theme.bold("Level")} ${game.level}`,
		`${theme.bold("Next")} ${game.nextKind}`,
		`${theme.bold("State")} ${status}`,
		`${theme.bold("Music")} ${music}`,
		"",
		theme.fg("accent", theme.bold("Controls")),
		createTetrisDividerLine(theme, width),
		...renderTetrisHelpLine(theme).split(" · "),
	];
}
