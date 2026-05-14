import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";

/**
 * Resolves the expected observations storage path for the isolated e2e environment.
 *
 * @param env Child-process environment.
 * @returns Expected observations directory path.
 */
function getExpectedObservationsPath(env: NodeJS.ProcessEnv): string {
	return join(env.NEXUS_CODING_AGENT_DIR ?? "", "observations");
}

test("nexus --observations-location prints the observations storage path without starting the TUI", async () => {
	const homeDir = await createReleaseTestHome();
	const env = createReleaseTestEnv(homeDir);

	try {
		const result = await runCommand(buildSourceCliCommand(["--observations-location"]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});

		assert.equal(result.timedOut, false);
		assert.equal(result.code, 0);
		assert.equal(result.output.trim(), getExpectedObservationsPath(env));
		assert.doesNotMatch(result.output, /Usage: nexus/u);
		assert.doesNotMatch(result.output, /Working/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});
