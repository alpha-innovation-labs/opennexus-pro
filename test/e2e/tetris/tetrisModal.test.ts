import assert from "node:assert/strict";
import test from "node:test";
import { createTetrisGame } from "../../../packages/mini-apps/src/tetris/game/createTetrisGame.js";
import { tickTetrisGame } from "../../../packages/mini-apps/src/tetris/game/tickTetrisGame.js";
import { moveTetrisPiece } from "../../../packages/mini-apps/src/tetris/game/moveTetrisPiece.js";
import { getTetrisCellHeight } from "../../../packages/mini-apps/src/tetris/ui/getTetrisCellHeight.js";
import { getTetrisCellWidth } from "../../../packages/mini-apps/src/tetris/ui/getTetrisCellWidth.js";
import { setTetrisMusicPreference } from "../../../packages/mini-apps/src/tetris/music/tetrisMusicPreference.js";
import { TetrisModal } from "../../../packages/mini-apps/src/tetris/ui/TetrisModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const theme = createTestTheme();

test("/tetris modal renders a full-screen playable Tetris board", async () => {
	const game = createTetrisGame();
	const viewport = await renderComponentInVirtualTerminal(
		(tui) => new TetrisModal(tui, theme, game, () => {}, { autoStart: false, autoStartMusic: false }),
		100,
		28,
	);
	const output = viewport.join("\n");

	const rendered = new TetrisModal({ requestRender() {}, terminal: { rows: 28 } } as never, theme, game, () => {}, { autoStart: false, autoStartMusic: false }).render(100);
	assert.ok(rendered.length <= 28);
	assert.ok(viewport.length >= 18);
	assert.match(viewport[0] ?? "", /^\s*┌/u);
	assert.match(viewport[1] ?? "", /│Tetris\s+│/u);
	assert.match(output, /┌ Score ─/u);
	assert.match(output, /┌ Tetris ─/u);
	assert.match(output, /Score\s+0/u);
	assert.match(output, /Lines\s+0/u);
	assert.match(output, /┌ Next brick ─/u);
	assert.doesNotMatch(output, /│O\s+│/u);
	assert.match(output, /┌ Hotkeys ─/u);
	assert.match(output, /Esc\/C\s+Hide/u);
	assert.match(output, /↑\s+Rotate/u);
	assert.match(output, /a\/d\s+Move/u);
	assert.match(output, /w\s+Rotate/u);
	assert.match(output, /s\s+Soft drop/u);
	assert.match(output, /f\s+Fullscreen/u);
	assert.match(output, /┌─+┐/u);
	assert.match(output, /█{8,}/u);
	assert.match(output, /·/u);
	assert.doesNotMatch(output, /┬|┼|┴/u);
	assert.doesNotMatch(output, /\+[-]+\+/u);
	assert.match(viewport.at(-1) ?? "", /^\s*└/u);
});

test("/tetris keyboard controls move pieces and close keys pause the hidden game", () => {
	const game = createTetrisGame();
	let closed = false;
	const modal = new TetrisModal({ requestRender() {} } as never, theme, game, () => { closed = true; }, { autoStart: false, autoStartMusic: false });
	const startColumn = game.active.column;

	modal.handleInput("\x1b[D");
	assert.equal(game.active.column, startColumn - 1);
	modal.handleInput("\x1b[C");
	assert.equal(game.active.column, startColumn);
	const startShapeHeight = game.active.shape.length;
	modal.handleInput("\x1b[A");
	assert.equal(game.active.shape[0]?.length, startShapeHeight);
	modal.handleInput("\x03");

	assert.equal(closed, true);
	assert.equal(game.paused, true);
});

test("/tetris scales cells proportionally to fit the remaining screen", () => {
	const wideCellWidth = getTetrisCellWidth(98, 21, 15, 20);
	const wideCellHeight = getTetrisCellHeight(wideCellWidth);
	const shortCellWidth = getTetrisCellWidth(98, 12, 15, 20);
	const shortCellHeight = getTetrisCellHeight(shortCellWidth);

	assert.equal(wideCellWidth, 2);
	assert.equal(shortCellWidth, 2);
	assert.equal(shortCellHeight, 1);
});

test("/tetris game has a twenty-row playfield", () => {
	const game = createTetrisGame();

	assert.equal(game.height, 20);
	assert.equal(game.board.length, 20);
	assert.equal(tickTetrisGame(game), true);
	assert.equal(game.active.row, 1);
});

test("/tetris keeps music disabled across pause and resume", () => {
	setTetrisMusicPreference(true);
	const game = createTetrisGame();
	const modal = new TetrisModal({ requestRender() {}, terminal: { rows: 28 } } as never, theme, game, () => {}, { autoStart: false });

	modal.handleInput("m");
	modal.handleInput("p");
	modal.handleInput("p");

	assert.doesNotMatch(modal.render(120).join("\n"), /Music\s+On/u);
	assert.match(modal.render(120).join("\n"), /Music\s+Off/u);
	modal.dispose();
});

test("/tetris close pauses music without disabling preference", () => {
	setTetrisMusicPreference(true);
	const first = new TetrisModal({ requestRender() {}, terminal: { rows: 28 } } as never, theme, createTetrisGame(), () => {}, { autoStart: false });
	first.handleInput("\x1b");
	const second = new TetrisModal({ requestRender() {}, terminal: { rows: 28 } } as never, theme, createTetrisGame(), () => {}, { autoStart: false });

	assert.doesNotMatch(second.render(120).join("\n"), /Music\s+Off/u);
	second.dispose();
});

test("/tetris remembers disabled music across panel reopen", () => {
	setTetrisMusicPreference(true);
	const first = new TetrisModal({ requestRender() {}, terminal: { rows: 28 } } as never, theme, createTetrisGame(), () => {}, { autoStart: false });
	first.handleInput("m");
	first.dispose();
	const second = new TetrisModal({ requestRender() {}, terminal: { rows: 28 } } as never, theme, createTetrisGame(), () => {}, { autoStart: false });

	assert.match(second.render(120).join("\n"), /Music\s+Off/u);
	second.dispose();
	setTetrisMusicPreference(true);
});

test("/tetris resumes the same paused game when opened again", () => {
	const game = createTetrisGame();
	moveTetrisPiece(game, -1);
	const movedColumn = game.active.column;
	const first = new TetrisModal({ requestRender() {} } as never, theme, game, () => {}, { autoStart: false, autoStartMusic: false });
	first.handleInput("\x1b");

	new TetrisModal({ requestRender() {} } as never, theme, game, () => {}, { autoStart: false, autoStartMusic: false });

	assert.equal(game.paused, false);
	assert.equal(game.active.column, movedColumn);
});
