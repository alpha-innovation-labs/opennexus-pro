import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runCliWithApp } from "../../apps/tui/src/cli/runCliWithApp.js";

/**
 * Creates an isolated observation state fixture for CLI tests.
 *
 * @returns Agent directory and persisted session id.
 */
async function createObservationFixture(): Promise<{ agentDir: string; sessionId: string }> {
	const agentDir = await mkdir(join(tmpdir(), `nexus-cli-observations-${Date.now()}-`), { recursive: true });
	const sessionId = "019dd45a-7d16-708d-a867-b9ecbe07c09d";
	const conversationId = `2026-04-28T13-49-53-302Z_${sessionId}`;
	const observationsDir = join(agentDir, "observations");
	await mkdir(observationsDir, { recursive: true });
	await writeFile(join(observationsDir, `${conversationId}.state.json`), `${JSON.stringify({
		conversationId,
		cwd: process.cwd(),
		sessionFile: null,
		updatedAt: 1,
		summary: "Fixture summary across all observations.",
		topics: [
			{
				index: 1,
				title: "Observation topic",
				startedAt: 1,
				sourceMessageIndex: 1,
				userMessages: ["User asked for CLI output"],
				assistantBullets: ["Assistant prints observations to stdout"],
			},
		],
	}, null, 2)}\n`, "utf8");
	return { agentDir, sessionId };
}

test("runCliWithApp prints observations for --observations and skips app startup", async () => {
	const originalConsoleLog = console.log;
	const originalNexusAgentDir = process.env.NEXUS_CODING_AGENT_DIR;
	const originalPiAgentDir = process.env.PI_CODING_AGENT_DIR;
	const { agentDir, sessionId } = await createObservationFixture();
	const output: string[] = [];
	let ranApp = false;

	console.log = (line?: unknown) => {
		output.push(String(line ?? ""));
	};
	process.env.NEXUS_CODING_AGENT_DIR = agentDir;
	process.env.PI_CODING_AGENT_DIR = agentDir;

	try {
		const exitCode = await runCliWithApp(["--observations", sessionId], {
			async runApp() {
				ranApp = true;
			},
		});

		assert.equal(exitCode, 0);
		assert.equal(ranApp, false);
		assert.doesNotMatch(output.join("\n"), /Fixture summary across all observations\./);
		assert.match(output.join("\n"), /Observation topic/);
		assert.doesNotMatch(output.join("\n"), /User asked for CLI output/);
		assert.doesNotMatch(output.join("\n"), /Assistant prints observations to stdout/);
	} finally {
		console.log = originalConsoleLog;
		process.env.NEXUS_CODING_AGENT_DIR = originalNexusAgentDir;
		process.env.PI_CODING_AGENT_DIR = originalPiAgentDir;
		await rm(agentDir, { recursive: true, force: true });
	}
});
