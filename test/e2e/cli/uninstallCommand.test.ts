import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import test from "node:test";
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

test("nexus --help lists the uninstall command", async () => {
	const homeDir = await createReleaseTestHome();
	const env = createReleaseTestEnv(homeDir);

	try {
		const result = await runCommand(buildSourceCliCommand(["--help"]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});

		assert.equal(result.timedOut, false);
		assert.equal(result.code, 0);
		assert.match(result.output, /nexus uninstall <source>/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

test("nexus uninstall --help prints Nexus uninstall usage", async () => {
	const homeDir = await createReleaseTestHome();
	const env = createReleaseTestEnv(homeDir);

	try {
		const result = await runCommand(buildSourceCliCommand(["uninstall", "--help"]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});

		assert.equal(result.timedOut, false);
		assert.equal(result.code, 0);
		assert.match(result.output, /Usage: nexus uninstall <source>/u);
		assert.match(result.output, /@aliou\/pi-processes/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

test("nexus uninstall removes a deterministic local package source", async () => {
	const homeDir = await createReleaseTestHome();
	const env = createReleaseTestEnv(homeDir);
	const packageDir = join(homeDir, "local-extension");
	await mkdir(packageDir, { recursive: true });

	try {
		const installResult = await runCommand(buildSourceCliCommand(["install", packageDir]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});
		assert.equal(installResult.code, 0);
		assert.deepEqual((await readSettings(homeDir)).packages, [relative(env.NEXUS_CODING_AGENT_DIR!, packageDir)]);

		const uninstallResult = await runCommand(buildSourceCliCommand(["uninstall", packageDir]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});
		const settings = await readSettings(homeDir);

		assert.equal(uninstallResult.timedOut, false);
		assert.equal(uninstallResult.code, 0);
		assert.match(uninstallResult.output, new RegExp(`Uninstalled ${packageDir.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}`, "u"));
		assert.deepEqual(settings.packages ?? [], []);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});
