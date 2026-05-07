import assert from "node:assert/strict";
import test from "node:test";
import { SharedModal } from "../../packages/tui-kit/src/modal/SharedModal.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

test("SharedModal fullScreen fills configured rows and full width", () => {
	const modal = new SharedModal({
		fullScreen: true,
		fullScreenRows: 12,
		panes: [{ id: "body", size: 1, lines: ["hello"] }],
		theme: createTestTheme(),
	});
	const lines = modal.render(80);

	assert.equal(lines.length, 12);
	assert.equal(lines.every((line) => line.length === 80), true);
});

test("SharedModal toggles fullScreen with default hotkey", () => {
	const changes: boolean[] = [];
	const modal = new SharedModal({
		fullScreenRows: 12,
		onFullScreenChange: (enabled) => changes.push(enabled),
		panes: [{ id: "body", size: 1, lines: ["hello"] }],
		theme: createTestTheme(),
	});

	modal.handleInput("f");
	const lines = modal.render(80);

	assert.deepEqual(changes, [true]);
	assert.equal(lines.length, 12);
	assert.equal(lines.every((line) => line.length === 80), true);
});

test("SharedModal toggles fullScreen with configured hotkey", () => {
	const changes: boolean[] = [];
	const modal = new SharedModal({
		fullScreenHotkey: "x",
		fullScreenRows: 12,
		onFullScreenChange: (enabled) => changes.push(enabled),
		panes: [{ id: "body", size: 1, lines: ["hello"] }],
		theme: createTestTheme(),
	});

	modal.handleInput("f");
	assert.deepEqual(changes, []);

	modal.handleInput("x");
	assert.deepEqual(changes, [true]);
});
