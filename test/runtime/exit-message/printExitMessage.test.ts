import assert from "node:assert/strict";
import test from "node:test";
import { setExitMessage } from "../../../src/extensions/exit-message/state/setExitMessage.js";
import { getExitMessage } from "../../../src/extensions/exit-message/state/getExitMessage.js";
import { printExitMessage } from "../../../src/runtime/exit-message/printExitMessage.js";

test("printExitMessage writes and clears the queued exit message", () => {
	const output: string[] = [];
	setExitMessage("Session title: Current system title");

	const printed = printExitMessage((text) => output.push(text));

	assert.equal(printed, true);
	assert.deepEqual(output, ["\nSession title: Current system title\n"]);
	assert.equal(getExitMessage(), undefined);
});

test("printExitMessage is a no-op when no message is queued", () => {
	const output: string[] = [];

	const printed = printExitMessage((text) => output.push(text));

	assert.equal(printed, false);
	assert.deepEqual(output, []);
});
