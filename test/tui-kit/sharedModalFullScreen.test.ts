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
