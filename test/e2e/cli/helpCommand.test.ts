import assert from "node:assert/strict";
import test from "node:test";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";
import { createHelpCommandEnv } from "./createHelpCommandEnv.js";

test("nexus -h prints Nexus-owned help without starting Pi", async () => {
	const homeDir = await createReleaseTestHome();
	const env = await createHelpCommandEnv(homeDir);

	try {
		const result = await runCommand(buildSourceCliCommand(["-h"]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});

		assert.equal(result.timedOut, false);
		assert.equal(result.code, 0);
		assert.match(result.output, /Usage: nexus \[options\] \[prompt\]/u);
		assert.match(result.output, /nexus automations -h/u);
		assert.doesNotMatch(result.output, /nexus social-chat -h/u);
		assert.doesNotMatch(result.output, /nexus annotation -h/u);
		assert.match(result.output, /--sessions/u);
		assert.match(result.output, /--sessions-all/u);
		assert.match(result.output, /--json/u);
		assert.doesNotMatch(result.output, /--observations-location/u);
		assert.match(result.output, /--chat-status-file-location/u);
		assert.match(result.output, /steer <session-id> <message>/u);
		assertSteerHelpIsInCommandsSection(result.output);
		assert.match(result.output, /--session-dir <path>/u);
		assert.doesNotMatch(result.output, /--session-dir=<path>/u);
		assert.match(result.output, /--resume \[session-id\]/u);
		assert.match(result.output, /-r \[session-id\]/u);
		assert.match(result.output, /--resume=<session-id>/u);
		assert.doesNotMatch(result.output, /--session <session-id>/u);
		assert.match(result.output, /--startup-profile/u);
		assert.match(result.output, /--no-extensions/u);
		assert.match(result.output, /-ne/u);
		assert.match(result.output, /-p <prompt>/u);
		assert.match(result.output, /--model <model>/u);
		assert.match(result.output, /--mode <mode>/u);
		assert.match(result.output, /--theme <path>/u);
		assert.match(result.output, /--prompt-template <path>/u);
		assert.match(result.output, /nexus observations list all\|<id>/u);
		assert.match(result.output, /nexus observations get-location/u);
		assertObservationsHelpIsInCommandsSection(result.output);
		assert.match(result.output, /nexus automations start/u);
		assert.match(result.output, /nexus automations status/u);
		assert.match(result.output, /nexus social-automation -h/u);
		assert.match(result.output, /nexus social-automation status/u);
		assert.doesNotMatch(result.output, /nexus social-chat start/u);
		assert.doesNotMatch(result.output, /nexus social-chat status/u);
		assert.doesNotMatch(result.output, /nexus list/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

/**
 * Verifies observations subcommands are displayed in Commands, not Options.
 *
 * @param output Help output.
 */
function assertObservationsHelpIsInCommandsSection(output: string): void {
	const { optionsSection, commandsSection } = readTopLevelHelpSections(output);
	assert.doesNotMatch(optionsSection, /nexus observations/u);
	assert.match(commandsSection, /nexus observations list all\|<id>/u);
}

/**
 * Verifies steer subcommand help is displayed in Commands, not Options.
 *
 * @param output Help output.
 */
function assertSteerHelpIsInCommandsSection(output: string): void {
	const { optionsSection, commandsSection } = readTopLevelHelpSections(output);
	assert.doesNotMatch(optionsSection, /steer <session-id> <message>/u);
	assert.match(commandsSection, /steer <session-id> <message>/u);
}

/**
 * Reads the top-level help sections needed by section placement assertions.
 *
 * @param output Help output.
 * @returns Options and commands section text.
 */
function readTopLevelHelpSections(output: string): { optionsSection: string; commandsSection: string } {
	const optionsStart = output.indexOf("Options:");
	const commandsStart = output.indexOf("Commands:");
	const passthroughStart = output.indexOf("Passthrough options:");
	assert.notEqual(optionsStart, -1);
	assert.notEqual(commandsStart, -1);
	assert.notEqual(passthroughStart, -1);
	return {
		optionsSection: output.slice(optionsStart, commandsStart),
		commandsSection: output.slice(commandsStart, passthroughStart),
	};
}

test("source nexus automations -h prints scoped automations help when enabled", async () => {
	const homeDir = await createReleaseTestHome();
	const env = await createHelpCommandEnv(homeDir);

	try {
		const result = await runCommand(buildSourceCliCommand(["automations", "-h"]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});

		assert.equal(result.timedOut, false);
		assert.equal(result.code, 0);
		assert.match(result.output, /Usage: nexus automations <start\|stop\|status\|list\|create\|edit\|delete\|templates>/u);
		assert.doesNotMatch(result.output, /nexus automations is not available/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

test("source nexus social-chat -h reports disabled command when unavailable", async () => {
	const homeDir = await createReleaseTestHome();
	const env = await createHelpCommandEnv(homeDir);

	try {
		const result = await runCommand(buildSourceCliCommand(["social-chat", "-h"]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});

		assert.equal(result.timedOut, false);
		assert.equal(result.code, 1);
		assert.match(result.output, /nexus social-chat is not available/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

test("source nexus annotation -h reports disabled command when unavailable", async () => {
	const homeDir = await createReleaseTestHome();
	const env = await createHelpCommandEnv(homeDir);

	try {
		const result = await runCommand(buildSourceCliCommand(["annotation", "-h"]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});

		assert.equal(result.timedOut, false);
		assert.equal(result.code, 1);
		assert.match(result.output, /nexus annotation is not available/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});
