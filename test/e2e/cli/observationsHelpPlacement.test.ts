import assert from "node:assert/strict";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";

test("nexus -h lists observations subcommands in Commands", async () => {
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
		assertObservationsCommandsSection(result.output);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

/**
 * Verifies observations command help belongs to the Commands section.
 *
 * @param output Full help output.
 */
function assertObservationsCommandsSection(output: string): void {
	const optionsStart = output.indexOf("Options:");
	const commandsStart = output.indexOf("Commands:");
	const passthroughStart = output.indexOf("Passthrough options:");
	assert.notEqual(optionsStart, -1);
	assert.notEqual(commandsStart, -1);
	assert.notEqual(passthroughStart, -1);
	assert.ok(optionsStart < commandsStart);
	assert.ok(commandsStart < passthroughStart);
	const optionsSection = output.slice(optionsStart, commandsStart);
	const commandsSection = output.slice(commandsStart, passthroughStart);
	assert.doesNotMatch(optionsSection, /nexus observations/u);
	assert.match(commandsSection, /nexus observations list all\|<id>/u);
	assert.match(commandsSection, /nexus observations delete all\|<id>/u);
	assert.match(commandsSection, /nexus observations recreate all\|<id>/u);
	assert.match(commandsSection, /nexus observations get-location/u);
}
