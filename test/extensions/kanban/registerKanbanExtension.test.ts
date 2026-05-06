import assert from "node:assert/strict";
import test from "node:test";
import { registerKanbanExtension } from "../../../packages/mini-apps/src/kanban/registerKanbanExtension.js";

test("kanban mini-app registers the kanban command", () => {
	const commands: string[] = [];

	registerKanbanExtension({
		registerCommand(name: string) {
			commands.push(name);
		},
	} as never);

	assert.deepEqual(commands, ["kanban"]);
});
