import type { TetrisGame } from "../game/types";
import { renderTetrisBox } from "./renderTetrisBox";

/**
 * Formats one colored stat row.
 *
 * @param theme Active UI theme.
 * @param label Stat label.
 * @param value Stat value.
 * @param color Value color.
 * @returns Rendered stat row.
 */
function statRow(theme: any, label: string, value: string | number, color: string): string {
	return `${theme.fg("dim", label.padEnd(7))} ${theme.fg(color, String(value))}`;
}

/**
 * Renders the boxed score and state panel.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Panel width.
 * @param height Panel height.
 * @param musicPlaying Whether music is currently active.
 * @returns Boxed stats panel lines.
 */
export function renderTetrisStatsBox(theme: any, game: TetrisGame, width: number, height: number, musicPlaying: boolean): string[] {
	const status = game.gameOver ? "Game Over" : game.paused ? "Paused" : "Playing";
	return renderTetrisBox(theme, "Score", [
		statRow(theme, "Score", game.score, "accent"),
		statRow(theme, "Lines", game.lines, "syntaxType"),
		statRow(theme, "Level", game.level, "warning"),
		statRow(theme, "State", status, game.gameOver ? "error" : game.paused ? "warning" : "success"),
		statRow(theme, "Music", musicPlaying ? "On" : "Off", musicPlaying ? "syntaxType" : "error"),
	], width, height);
}
