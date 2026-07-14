import assert from "node:assert/strict";
import test from "node:test";
import { clearStartupScreen } from "../../../apps/tui/src/runtime/startup-screen/clearStartupScreen.js";

test("clearStartupScreen clears the viewport, homes the cursor, and clears scrollback", () => {
	let output = "";

	clearStartupScreen({
		write(value: string) {
			output += value;
		},
	});

	assert.equal(output, "\x1b[2J\x1b[H\x1b[3J");
});
