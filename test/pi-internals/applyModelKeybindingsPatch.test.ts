import assert from "node:assert/strict";
import test from "node:test";
import { KEYBINDINGS } from "../../src/../node_modules/@mariozechner/pi-coding-agent/dist/core/keybindings.js";
import { applyModelKeybindingsPatch } from "../../src/pi-internals/applyModelKeybindingsPatch.js";

test("applyModelKeybindingsPatch disables model picker and model cycling shortcuts", () => {
	applyModelKeybindingsPatch();

	assert.deepEqual(KEYBINDINGS["app.model.select"].defaultKeys, []);
	assert.deepEqual(KEYBINDINGS["app.model.cycleForward"].defaultKeys, []);
	assert.deepEqual(KEYBINDINGS["app.model.cycleBackward"].defaultKeys, []);
});
