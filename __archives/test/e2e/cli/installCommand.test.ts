import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import test from "node:test";
import { normalizeInstallSource } from "../../../apps/tui/src/cli/install/normalizeInstallSource.js";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";

/** Reads isolated Nexus settings JSON from a test HOME. */
async function readSettings(homeDir: string): Promise<{ packages?: string[] }> {
	const settingsPath = join(homeDir, ".config", "nexus", "settings.json");
	return JSON.parse(await readFile(settingsPath, "utf8")) as { packages?: string[] };
}

test("nexus install normalizes pi.dev package URLs to npm sources", () => {
	assert.equal(
		normalizeInstallSource("https://pi.dev/packages/@aliou/pi-processes?name=process"),
		"npm:@aliou/pi-processes",
	);
});

test("nexus install --help prints Nexus install usage", async () => {
	const homeDir = await createReleaseTestHome();
	const env = createReleaseTestEnv(homeDir);

	try {
		const result = await runCommand(buildSourceCliCommand(["install", "--help"]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});

		assert.equal(result.timedOut, false);
		assert.equal(result.code, 0);
		assert.match(result.output, /Usage: nexus install <source>/u);
		assert.match(result.output, /@aliou\/pi-processes/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

test("nexus install persists a deterministic local package source", async () => {
	const homeDir = await createReleaseTestHome();
	const env = createReleaseTestEnv(homeDir);
	const packageDir = join(homeDir, "local-extension");
	await mkdir(packageDir, { recursive: true });

	try {
		const result = await runCommand(buildSourceCliCommand(["install", packageDir]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});
		const settings = await readSettings(homeDir);

		assert.equal(result.timedOut, false);
		assert.equal(result.code, 0);
		assert.match(result.output, new RegExp(`Installed ${packageDir.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}`, "u"));
		assert.deepEqual(settings.packages, [relative(env.NEXUS_CODING_AGENT_DIR!, packageDir)]);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});
