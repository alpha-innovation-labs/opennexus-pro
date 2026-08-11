import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";
import { getTetrisCells } from "../game/getTetrisCells";
import type { TetrisGame } from "../game/types";

const CELL_COLORS: Record<string, string> = {
	I: "accent",
	O: "warning",
	T: "accent",
	S: "success",
	Z: "error",
	J: "borderAccent",
	L: "toolTitle",
};

/**
 * Renders the bordered Tetris playfield.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @returns Board lines.
 */
export function renderTetrisBoard(theme: SharedModalTheme & { bold: (text: string) => string }, game: TetrisGame): string[] {
	const cells = getTetrisCells(game);
	const horizontal = "─".repeat(game.width * 2);
	const topBorder = theme.fg("borderMuted", `┌${horizontal}┐`);
	const bottomBorder = theme.fg("borderMuted", `└${horizontal}┘`);
	const rows = cells.map((row) => {
		const content = row.map((cell) => cell ? theme.fg(CELL_COLORS[cell] ?? "accent", "██") : "  ").join("");
		return `${theme.fg("borderMuted", "│")}${content}${theme.fg("borderMuted", "│")}`;
	});
	return [topBorder, ...rows, bottomBorder];
}
