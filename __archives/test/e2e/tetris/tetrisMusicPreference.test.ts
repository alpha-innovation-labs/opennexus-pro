import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { readNexusUserConfig } from "../../../packages/nexus-runtime/src/config/readNexusUserConfig.js";
import { readTetrisMusicPreference } from "../../../packages/mini-apps/src/tetris/music/readTetrisMusicPreference.js";
import { writeTetrisMusicPreference } from "../../../packages/mini-apps/src/tetris/music/writeTetrisMusicPreference.js";

test("/tetris persists music preference under miniApps in Nexus user config", async () => {
	const configHome = await mkdtemp(join(tmpdir(), "nexus-tetris-config-"));
	const previousXdgConfigHome = process.env.XDG_CONFIG_HOME;
	process.env.XDG_CONFIG_HOME = configHome;
	try {
		writeTetrisMusicPreference(false);

		assert.equal(readTetrisMusicPreference(), false);
		assert.deepEqual(readNexusUserConfig().miniApps?.tetris, { musicEnabled: false });
	} finally {
		if (previousXdgConfigHome === undefined) delete process.env.XDG_CONFIG_HOME;
		else process.env.XDG_CONFIG_HOME = previousXdgConfigHome;
		await rm(configHome, { recursive: true, force: true });
	}
});
