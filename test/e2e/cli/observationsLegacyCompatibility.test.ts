import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";

test("nexus --observations reads legacy state artifacts", async () => {
	const homeDir = await createReleaseTestHome();
	const env = { ...createReleaseTestEnv(homeDir), PI_OFFLINE: "1" };
	const observationsDir = join(homeDir, ".local", "share", "nexus", "agent", "observations");
	const sessionId = "legacy-session";
	const conversationId = `cwd_${sessionId}`;
	const legacyStatePath = join(observationsDir, `${conversationId}.state.json`);

	try {
		await mkdir(observationsDir, { recursive: true });
		await writeFile(legacyStatePath, `${JSON.stringify({
			conversationId,
			cwd: process.cwd(),
			sessionFile: null,
			updatedAt: 1,
			messageCount: 2,
			summary: "Legacy summary",
			topics: [{
				index: 1,
				title: "Review legacy observations",
				startedAt: 1,
				sourceMessageIndex: 1,
				userMessages: ["show old observations"],
				assistantBullets: ["Kept legacy read compatibility"],
			}],
		})}\n`, "utf8");

		const result = await runCommand(buildSourceCliCommand(["--observations", sessionId]), {
			cwd: process.cwd(),
			env,
			timeoutMs: 25_000,
		});

		assert.equal(result.code, 0);
		assert.match(result.output, /Review legacy observations/u);
		assert.doesNotMatch(result.output, /No observations yet/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});
