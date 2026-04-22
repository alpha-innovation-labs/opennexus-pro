import assert from "node:assert/strict";
import test from "node:test";
import { createTempKanbanBoard } from "../../../src/extensions/kanban/data/createTempKanbanBoard.js";
import { KanbanModal } from "../../../src/extensions/kanban/modal/KanbanModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("kanban modal renders in-loop and completed tasks in the virtual terminal", async () => {
	const board = createTempKanbanBoard();
	const viewport = await renderComponentInVirtualTerminal(
		() => new KanbanModal(createTestTheme(), board.inLoopItems, board.detailsByValue, board.completedLines, () => undefined),
	);
	const output = viewport.join("\n");

	assert.match(output, /In Loop/);
	assert.match(output, /Completed/);
	assert.match(output, /Polish modal layout/);
	assert.match(output, /Draft extension folder structure/);
	assert.match(output, /Selected Task/);
	assert.match(output, /Status: In loop/);
});
