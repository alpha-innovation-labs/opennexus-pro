import assert from "node:assert/strict";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
// @ts-expect-error Release helper modules are authored as mjs scripts without declarations.
import { copyTetrisMusicAsset, getTetrisMusicAssetReleasePath } from "../../../../scripts/release/binary/copyTetrisMusicAsset.mjs";

const releasePath = getTetrisMusicAssetReleasePath();

/**
 * Returns whether a file exists.
 *
 * @param {string} path File path to inspect.
 * @returns {Promise<boolean>} True when the file exists.
 */
async function fileExists(path: string) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

test("copyTetrisMusicAsset skips the mp3 when tetris is disabled", async () => {
	const dir = await mkdtemp(join(tmpdir(), "nexus-tetris-disabled-"));
	try {
		const copied = await copyTetrisMusicAsset(dir, { extensions: { tetris: { enabled: false } } });

		assert.equal(copied, false);
		assert.equal(await fileExists(join(dir, releasePath)), false);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

test("copyTetrisMusicAsset copies the mp3 when tetris is enabled", async () => {
	const dir = await mkdtemp(join(tmpdir(), "nexus-tetris-enabled-"));
	try {
		const copied = await copyTetrisMusicAsset(dir, { extensions: { tetris: { enabled: true } } });

		assert.equal(copied, true);
		assert.equal(await fileExists(join(dir, releasePath)), true);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});
