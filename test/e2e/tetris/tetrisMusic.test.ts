import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { getTetrisMusicAssetPath } from "../../../packages/mini-apps/src/tetris/music/getTetrisMusicAssetPath.js";
import { startTetrisMusic } from "../../../packages/mini-apps/src/tetris/music/startTetrisMusic.js";
import { stopTetrisMusic } from "../../../packages/mini-apps/src/tetris/music/stopTetrisMusic.js";

test("/tetris music asset resolves to the bundled mp3", () => {
	const assetPath = getTetrisMusicAssetPath();

	assert.ok(assetPath);
	assert.equal(existsSync(assetPath), true);
	assert.match(assetPath, /za-rus\.mp3$/u);
});

test("/tetris music player starts and stops on macOS", { skip: process.platform !== "darwin" }, async () => {
	const player = startTetrisMusic();

	assert.ok(player?.pid);
	stopTetrisMusic(player);
	await new Promise((resolve) => setTimeout(resolve, 50));
});
