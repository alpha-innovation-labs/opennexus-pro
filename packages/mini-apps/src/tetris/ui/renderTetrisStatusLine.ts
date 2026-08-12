import type { SharedModalTheme } from "@nexus/tui-kit";
import type { TetrisGame } from "../game/types";

/**
 * Renders the single-line Tetris score and state header.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @returns One status line.
 */
export function renderTetrisStatusLine(
	theme: SharedModalTheme & { bold: (text: string) => string },
	game: TetrisGame,
): string {
	const status = game.gameOver
		? "Game Over"
		: game.paused
			? "Paused"
			: "Playing";
	return [
		`${theme.bold("Score")} ${game.score}`,
		`${theme.bold("Lines")} ${game.lines}`,
		`${theme.bold("Level")} ${game.level}`,
		`${theme.bold("Next")} ${game.nextKind}`,
		`${theme.bold("State")} ${status}`,
	].join("   ");
}
