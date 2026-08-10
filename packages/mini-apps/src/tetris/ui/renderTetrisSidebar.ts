import type { TetrisGame } from "../game/types";

/**
 * Renders score and control text beside the board.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @returns Sidebar lines.
 */
export function renderTetrisSidebar(theme: any, game: TetrisGame): string[] {
	const status = game.gameOver ? "Game Over" : game.paused ? "Paused" : "Playing";
	return [
		theme.fg("accent", theme.bold("Tetris")),
		"",
		`${theme.bold("Score")} ${game.score}`,
		`${theme.bold("Lines")} ${game.lines}`,
		`${theme.bold("Level")} ${game.level}`,
		`${theme.bold("Next")} ${game.nextKind}`,
		`${theme.bold("State")} ${status}`,
		"",
		theme.fg("dim", "Esc hides · ←→ move · ↑ rotate · ↓ soft drop · Space hard drop"),
		theme.fg("dim", "p pauses · r restarts"),
	];
}
