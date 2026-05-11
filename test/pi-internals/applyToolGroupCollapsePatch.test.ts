import assert from "node:assert/strict";
import test from "node:test";
import { applyToolGroupCollapsePatch } from "../../packages/pi-platform/src/applyToolGroupCollapsePatch.js";
import { KEYBINDINGS } from "../../node_modules/@earendil-works/pi-coding-agent/dist/core/keybindings.js";

test("tool-group collapse patch registers ctrl+shift+c", () => {
	applyToolGroupCollapsePatch();

	assert.deepEqual((KEYBINDINGS as unknown as Record<string, { defaultKeys: string; description: string }>)["app.tools.collapse"], {
		defaultKeys: "shift+ctrl+c",
		description: "Collapse tool groups into summaries",
	});
});
