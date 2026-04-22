import assert from "node:assert/strict";
import test from "node:test";
import { registerKanbanExtension } from "../../../src/extensions/kanban/registerKanbanExtension.js";

test("kanban extension registers the extension command", () => {
	const commands: string[] = [];

	registerKanbanExtension({
		registerCommand(name: string) {
			commands.push(name);
		},
	} as never);

	assert.deepEqual(commands, ["extension"]);
});
