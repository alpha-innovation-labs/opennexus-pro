import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";
import type { TetrisRenderCell } from "../game/getTetrisRenderCells";

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
 * Renders one Tetris cell segment with a stable left-edge grid anchor.
 *
 * @param theme Active UI theme.
 * @param cell Render cell value.
 * @param cellWidth Width of each cell.
 * @returns Rendered cell segment.
 */
export function renderTetrisCellSegment(
	theme: SharedModalTheme & { bold: (text: string) => string },
	cell: TetrisRenderCell,
	cellWidth: number,
): string {
	if (cell === "ghost") return theme.fg("borderMuted", "░".repeat(cellWidth));
	if (cell)
		return theme.fg(CELL_COLORS[cell] ?? "accent", "█".repeat(cellWidth));
	return theme.fg(
		"borderMuted",
		`${"·"}${" ".repeat(Math.max(0, cellWidth - 1))}`,
	);
}
