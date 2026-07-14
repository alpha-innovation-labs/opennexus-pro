import assert from "node:assert/strict";
import test from "node:test";
import { renderTetrisBoard } from "../../../packages/mini-apps/src/tetris/ui/renderTetrisBoard.js";
import type { TetrisCell, TetrisGame } from "../../../packages/mini-apps/src/tetris/game/types.js";

const VALID_THEME_COLORS = new Set(["accent", "borderAccent", "borderMuted", "success", "error", "warning", "toolTitle"]);

/**
 * Creates a strict theme stub that rejects colors not exposed by Pi themes.
 *
 * @param usedColors Mutable list that records requested foreground colors.
 * @returns Theme-like object for board rendering.
 */
function createStrictTheme(usedColors: string[]): { fg(color: string, value: string): string } {
	return {
		fg(color: string, value: string): string {
			usedColors.push(color);
			if (!VALID_THEME_COLORS.has(color)) throw new Error(`Unknown theme color: ${color}`);
			return value;
		},
	};
}

/**
 * Creates a compact Tetris game whose board contains every tetromino kind.
 *
 * @returns Tetris game fixture.
 */
function createPaletteGame(): TetrisGame {
	const pieces: Exclude<TetrisCell, "">[] = ["I", "O", "T", "S", "Z", "J", "L"];
	return {
		width: pieces.length,
		height: 1,
		board: [pieces],
		active: { kind: "I", shape: [[0]], row: 0, column: 0 },
		nextKind: "O",
		pieceIndex: 0,
		score: 0,
		lines: 0,
		level: 1,
		gameOver: false,
		paused: false,
	};
}

test("renderTetrisBoard only uses colors supported by Pi themes", () => {
	const usedColors: string[] = [];
	const lines = renderTetrisBoard(createStrictTheme(usedColors), createPaletteGame());

	assert.equal(lines.length, 3);
	assert.deepEqual(new Set(usedColors), new Set(["borderMuted", "accent", "warning", "success", "error", "borderAccent", "toolTitle"]));
});
