import assert from "node:assert/strict";
import test from "node:test";
import { spawn } from "node-pty";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { buildSourceCliCommand } from "../cli/buildSourceCliCommand.js";

/**
 * Captures the initial interactive Nexus startup screen from a pseudo-terminal.
 *
 * @param command Command that starts Nexus.
 * @param env Process environment for the test run.
 * @returns Startup terminal output captured before shutdown.
 */
async function captureStartupScreen(command: string, env: NodeJS.ProcessEnv): Promise<string> {
	return new Promise((resolve) => {
		const term = spawn("bash", ["-lc", command], {
			name: "xterm-256color",
			cols: 120,
			rows: 40,
			cwd: process.cwd(),
			env,
		});
		let output = "";
		const timer = setTimeout(() => {
			term.kill();
			resolve(output);
		}, 10_000);
		term.onData((data) => {
			output += data;
			if (/Pi can explain its own features|Press ctrl\+o to show full startup help/u.test(output)) {
				clearTimeout(timer);
				term.kill();
				resolve(output);
			}
		});
	});
}

test("startup screen must not show upstream Pi help content", async () => {
	const homeDir = await createReleaseTestHome();
	const env = createReleaseTestEnv(homeDir);

	try {
		const output = await captureStartupScreen(buildSourceCliCommand(["--verbose"]), env);

		assert.doesNotMatch(output, /\bpi v\d+\.\d+\.\d+/iu);
		assert.doesNotMatch(output, /Press ctrl\+o to show full startup help/u);
		assert.doesNotMatch(output, /Pi can explain its own features/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});
