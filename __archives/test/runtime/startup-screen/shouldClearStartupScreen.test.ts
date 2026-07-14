import assert from "node:assert/strict";
import test from "node:test";
import { shouldClearStartupScreen } from "../../../apps/tui/src/runtime/startup-screen/shouldClearStartupScreen.js";

test("shouldClearStartupScreen allows fresh interactive launches", () => {
	assert.equal(shouldClearStartupScreen([], { isTTY: true }, { isTTY: true }), true);
});

test("shouldClearStartupScreen blocks launches with arguments", () => {
	assert.equal(shouldClearStartupScreen(["--help"], { isTTY: true }, { isTTY: true }), false);
	assert.equal(shouldClearStartupScreen(["--resume"], { isTTY: true }, { isTTY: true }), false);
});

test("shouldClearStartupScreen blocks non-tty streams", () => {
	assert.equal(shouldClearStartupScreen([], { isTTY: false }, { isTTY: true }), false);
	assert.equal(shouldClearStartupScreen([], { isTTY: true }, { isTTY: false }), false);
});
