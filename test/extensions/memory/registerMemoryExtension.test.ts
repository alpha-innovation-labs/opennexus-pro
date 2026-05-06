import assert from "node:assert/strict";
import test from "node:test";
import { registerMemoryExtension } from "../../../packages/mini-apps/src/memory/registerMemoryExtension.js";

test("memory mini-app registers in the Mini-Apps slash menu group", () => {
	const commands: Array<{ name: string; menuGroup?: string }> = [];

	registerMemoryExtension({
		registerCommand(name: string, definition: { menuGroup?: string }) {
			commands.push({ name, menuGroup: definition.menuGroup });
		},
		registerTool() {},
		on() {},
	} as never);

	assert.deepEqual(commands, [{ name: "memory", menuGroup: "Mini-Apps" }]);
});
