import assert from "node:assert/strict";
import test from "node:test";
import { createTetrisGame } from "../../../packages/mini-apps/src/tetris/game/createTetrisGame.js";
import { TetrisModal } from "../../../packages/mini-apps/src/tetris/ui/TetrisModal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates the minimal TUI host used by Tetris modal rendering.
 *
 * @param rows Terminal row count.
 * @returns Fake Tetris modal host.
 */
function createTetrisHost(rows: number): { terminal: { rows: number }; requestRender: () => void; renderRequests: number } {
	return {
		terminal: { rows },
		renderRequests: 0,
		requestRender(): void {
			this.renderRequests += 1;
		},
	};
}

test("tetris fullscreen toggle fills host rows and keeps the bottom border", () => {
	const host = createTetrisHost(16);
	const modal = new TetrisModal(host, createTestTheme(), createTetrisGame(), () => undefined, {
		autoStart: false,
		autoStartMusic: false,
		initialFullScreen: false,
	});

	modal.handleInput("f");
	const viewport = modal.render(80);

	assert.equal(host.renderRequests > 0, true);
	assert.equal(viewport.length, 16);
	assert.equal(viewport[0]?.startsWith("┌"), true);
	assert.equal(viewport.at(-1)?.startsWith("└"), true);
});
