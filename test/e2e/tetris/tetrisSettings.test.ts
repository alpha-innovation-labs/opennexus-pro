import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { readNexusUserConfig } from "../../../packages/nexus-runtime/src/config/readNexusUserConfig.js";
import { readTetrisSettings } from "../../../packages/mini-apps/src/tetris/settings/readTetrisSettings.js";
import { writeTetrisSettings } from "../../../packages/mini-apps/src/tetris/settings/writeTetrisSettings.js";

test("/tetris persists fullscreen under miniApps in Nexus user config", async () => {
	const configHome = await mkdtemp(join(tmpdir(), "nexus-tetris-settings-"));
	const previousXdgConfigHome = process.env.XDG_CONFIG_HOME;
	process.env.XDG_CONFIG_HOME = configHome;
	try {
		writeTetrisSettings({ fullscreen: true });

		assert.equal(readTetrisSettings().fullscreen, true);
		assert.equal(readNexusUserConfig().miniApps?.tetris?.fullscreen, true);
	} finally {
		if (previousXdgConfigHome === undefined) delete process.env.XDG_CONFIG_HOME;
		else process.env.XDG_CONFIG_HOME = previousXdgConfigHome;
		await rm(configHome, { recursive: true, force: true });
	}
});
