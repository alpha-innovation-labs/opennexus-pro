import type { SharedModalTheme } from "@nexus/tui-kit";
import { TETROMINOES } from "../game/tetrominoes";
import type { TetrisGame } from "../game/types";
import { centerTetrisLine } from "./centerTetrisLine";
import { renderTetrisBox } from "./renderTetrisBox";
import { renderTetrisCellSegment } from "./renderTetrisCellSegment";

/**
 * Renders the boxed next-piece preview.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Panel width.
 * @param height Panel height.
 * @returns Boxed next-piece panel lines.
 */
export function renderTetrisNextBox(
	theme: SharedModalTheme & { bold: (text: string) => string },
	game: TetrisGame,
	width: number,
	height: number,
): string[] {
	const shape = TETROMINOES[game.nextKind];
	const innerWidth = Math.max(1, width - 2);
	const cellWidth = 2;
	const preview = shape.map((row) =>
		centerTetrisLine(
			row
				.map((cell) =>
					cell
						? renderTetrisCellSegment(theme, game.nextKind, cellWidth)
						: " ".repeat(cellWidth),
				)
				.join(""),
			innerWidth,
		),
	);
	const topPad = Math.max(0, Math.floor((height - 2 - preview.length) / 2));
	return renderTetrisBox(
		theme,
		"Next brick",
		[...Array.from({ length: topPad }, () => ""), ...preview],
		width,
		height,
	);
}
