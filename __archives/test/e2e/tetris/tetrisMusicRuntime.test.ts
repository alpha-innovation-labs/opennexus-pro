import assert from "node:assert/strict";
import test from "node:test";
import { ensureTetrisMusicRunning, isTetrisMusicRunning, pauseTetrisMusicRuntime, stopTetrisMusicRuntime } from "../../../packages/mini-apps/src/tetris/music/tetrisMusicRuntime.js";
import { getTetrisMusicPlayerScript } from "../../../packages/mini-apps/src/tetris/music/getTetrisMusicPlayerScript.js";

test("/tetris music runtime pauses and resumes without stopping", { skip: getTetrisMusicPlayerScript() === null }, async () => {
	ensureTetrisMusicRunning();
	assert.equal(isTetrisMusicRunning(), true);
	pauseTetrisMusicRuntime();
	assert.equal(isTetrisMusicRunning(), false);
	ensureTetrisMusicRunning();
	assert.equal(isTetrisMusicRunning(), true);
	stopTetrisMusicRuntime();
});
