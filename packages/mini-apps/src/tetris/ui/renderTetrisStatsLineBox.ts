import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";
import type { TetrisGame } from "../game/types";
import { renderTetrisBox } from "./renderTetrisBox";

/**
 * Renders compact score/status details as colored stacked rows.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Panel width.
 * @param musicPlaying Whether music is currently active.
 * @returns Boxed stats panel.
 */
export function renderTetrisStatsLineBox(
	theme: SharedModalTheme & { bold: (text: string) => string },
	game: TetrisGame,
	width: number,
	musicPlaying: boolean,
): string[] {
	const status = game.gameOver
		? "Game Over"
		: game.paused
			? "Paused"
			: "Playing";
	return renderTetrisBox(
		theme,
		"Score",
		[
			`${theme.fg("dim", "Score")} ${theme.fg("accent", String(game.score))}`,
			`${theme.fg("dim", "Lines")} ${theme.fg("syntaxType", String(game.lines))}`,
			`${theme.fg("dim", "Level")} ${theme.fg("warning", String(game.level))}`,
			`${theme.fg("dim", "State")} ${theme.fg(game.gameOver ? "error" : game.paused ? "warning" : "success", status)}`,
			`${theme.fg("dim", "Music")} ${theme.fg(musicPlaying ? "syntaxType" : "error", musicPlaying ? "On" : "Off")}`,
		],
		width,
		Math.min(7, Math.max(3, width)),
	);
}
