import type { TetrisGame } from "../game/types.js";
import { renderTetrisBox } from "./renderTetrisBox.js";

/**
 * Renders compact score/status details on a single line.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Panel width.
 * @param musicPlaying Whether music is currently active.
 * @returns Boxed one-line stats panel.
 */
export function renderTetrisStatsLineBox(theme: any, game: TetrisGame, width: number, musicPlaying: boolean): string[] {
	const status = game.gameOver ? "Game Over" : game.paused ? "Paused" : "Playing";
	const line = [
		`${theme.fg("dim", "Score")} ${theme.fg("accent", String(game.score))}`,
		`${theme.fg("dim", "Lines")} ${theme.fg("syntaxType", String(game.lines))}`,
		`${theme.fg("dim", "Level")} ${theme.fg("warning", String(game.level))}`,
		`${theme.fg("dim", "State")} ${theme.fg(game.gameOver ? "error" : game.paused ? "warning" : "success", status)}`,
		`${theme.fg("dim", "Music")} ${theme.fg(musicPlaying ? "syntaxType" : "error", musicPlaying ? "On" : "Off")}`,
	].join("  ");
	return renderTetrisBox(theme, "Score", [line], width, 3);
}
