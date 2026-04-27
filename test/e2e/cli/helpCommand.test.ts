import assert from "node:assert/strict";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";

test("nexus -h prints Nexus-owned help without starting Pi", async () => {
	const homeDir = await createReleaseTestHome();
	const env = createReleaseTestEnv(homeDir);

	try {
		const result = await runCommand(buildSourceCliCommand(["-h"]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});

		assert.equal(result.timedOut, false);
		assert.equal(result.code, 0);
		assert.match(result.output, /Usage: nexus \[options\] \[prompt\]/u);
		assert.match(result.output, /nexus gateway -h/u);
		assert.match(result.output, /--session-dir=<path>/u);
		assert.match(result.output, /--resume \[session-id\]/u);
		assert.match(result.output, /-r \[session-id\]/u);
		assert.match(result.output, /--resume=<session-id>/u);
		assert.match(result.output, /--session <session-id>/u);
		assert.match(result.output, /--startup-profile/u);
		assert.match(result.output, /--no-extensions/u);
		assert.match(result.output, /-ne/u);
		assert.match(result.output, /-p <prompt>/u);
		assert.match(result.output, /--model <model>/u);
		assert.match(result.output, /--mode <mode>/u);
		assert.match(result.output, /--theme <path>/u);
		assert.match(result.output, /--prompt-template <path>/u);
		assert.match(result.output, /nexus gateway start/u);
		assert.match(result.output, /nexus gateway status/u);
		assert.doesNotMatch(result.output, /nexus list/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

test("nexus gateway -h prints scoped gateway help", async () => {
	const homeDir = await createReleaseTestHome();
	const env = createReleaseTestEnv(homeDir);

	try {
		const result = await runCommand(buildSourceCliCommand(["gateway", "-h"]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});

		assert.equal(result.timedOut, false);
		assert.equal(result.code, 0);
		assert.match(result.output, /Usage: nexus gateway <start\|stop\|restart\|status>/u);
		assert.doesNotMatch(result.output, /adapter/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});
