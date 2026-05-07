import { getTetrisRenderCells, type TetrisRenderCell } from "../game/getTetrisRenderCells.js";
import type { TetrisGame } from "../game/types.js";
import { centerTetrisLine } from "./centerTetrisLine.js";
import { createTetrisSegmentWidths } from "./createTetrisSegmentWidths.js";
import { getTetrisCellWidth } from "./getTetrisCellWidth.js";
import { renderTetrisCellSegment } from "./renderTetrisCellSegment.js";

/**
 * Renders a proportional Tetris board centered inside the requested modal area.
 *
 * @param theme Active UI theme.
 * @param game Current game state.
 * @param width Target board area width including outer padding.
 * @param height Target board area height including outer padding.
 * @param options Render options.
 * @returns Board area lines.
 */
export function renderScaledTetrisBoard(theme: any, game: TetrisGame, width: number, height: number, options: { fillWidth?: boolean; title?: string } = {}): string[] {
	const defaultCellWidth = getTetrisCellWidth(width, height, game.width, game.height);
	const boardInnerWidth = options.fillWidth ? Math.max(game.width, width - 2) : defaultCellWidth * game.width;
	const columnWidths = options.fillWidth ? createTetrisSegmentWidths(boardInnerWidth, game.width) : Array.from({ length: game.width }, () => defaultCellWidth);
	const title = options.title ? ` ${options.title} ` : "";
	const topBorder = centerTetrisLine(theme.fg("borderMuted", `┌${title}${"─".repeat(Math.max(0, boardInnerWidth - title.length))}┐`), width);
	const bottomBorder = centerTetrisLine(theme.fg("borderMuted", `└${"─".repeat(boardInnerWidth)}┘`), width);
	const rows = getTetrisRenderCells(game).map((row) => centerTetrisLine(renderScaledTetrisRow(theme, row, columnWidths), width));
	const visibleRows = Math.max(0, height - 2);
	const clippedRows = rows.slice(0, visibleRows);
	if (game.gameOver && clippedRows.length > 0) {
		const overlayRow = Math.floor(clippedRows.length / 2);
		clippedRows[overlayRow] = centerTetrisLine(theme.fg("error", theme.bold(" Game Over! ")), width);
	}
	return [topBorder, ...clippedRows, bottomBorder].slice(0, height);
}

/**
 * Renders one scaled playfield row.
 *
 * @param theme Active UI theme.
 * @param row Logical Tetris row.
 * @param cellWidth Width of each cell.
 * @returns One rendered row.
 */
function renderScaledTetrisRow(theme: any, row: TetrisRenderCell[], columnWidths: number[]): string {
	const content = row.map((cell, index) => renderTetrisCellSegment(theme, cell, columnWidths[index] ?? 1)).join("");
	return `${theme.fg("borderMuted", "│")}${content}${theme.fg("borderMuted", "│")}`;
}
