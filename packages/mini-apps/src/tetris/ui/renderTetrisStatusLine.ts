import type { TetrisGame } from "../game/types";

/**
 * Renders the single-line Tetris score and state header.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @returns One status line.
 */
export function renderTetrisStatusLine(theme: any, game: TetrisGame): string {
	const status = game.gameOver ? "Game Over" : game.paused ? "Paused" : "Playing";
	return [
		`${theme.bold("Score")} ${game.score}`,
		`${theme.bold("Lines")} ${game.lines}`,
		`${theme.bold("Level")} ${game.level}`,
		`${theme.bold("Next")} ${game.nextKind}`,
		`${theme.bold("State")} ${status}`,
	].join("   ");
}
