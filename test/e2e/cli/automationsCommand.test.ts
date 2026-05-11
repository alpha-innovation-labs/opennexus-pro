import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { buildAutomationInput } from "../../../packages/mini-apps/src/automations/command/buildAutomationInput.js";
import { spawnAutomationPromptRun } from "../../../packages/mini-apps/src/automations/core/runs/spawnAutomationPromptRun.js";
import { createAutomation } from "../../../packages/mini-apps/src/automations/core/storage/createAutomation.js";
import { createAutomationRun } from "../../../packages/mini-apps/src/automations/core/storage/createAutomationRun.js";
import { getAutomationByIdOrName } from "../../../packages/mini-apps/src/automations/core/storage/getAutomationByIdOrName.js";
import { updateAutomationNextRunAt } from "../../../packages/mini-apps/src/automations/core/storage/updateAutomationNextRunAt.js";
import { withAutomationDatabase } from "../../../packages/mini-apps/src/automations/core/storage/withAutomationDatabase.js";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";

/**
 * Runs one source Nexus automations command in an isolated home.
 *
 * @param homeDir Isolated test home.
 * @param args Nexus CLI args.
 * @returns Command result.
 */
async function runAutomationsCli(homeDir: string, args: readonly string[]) {
	return runCommand(buildSourceCliCommand(args), {
		cwd: process.cwd(),
		env: { ...createReleaseTestEnv(homeDir), NEXUS_CONFIG_DIR: join(homeDir, ".config", "nexus"), NEXUS_AUTOMATIONS_TICK_MS: "1000" },
		timeoutMs: 25_000,
	});
}

/**
 * Runs a callback with Nexus storage pointed at an isolated home.
 *
 * @param homeDir Isolated test home.
 * @param callback Work to execute with isolated Nexus config.
 * @returns Callback result.
 */
async function withIsolatedAutomationHome<T>(homeDir: string, callback: () => T | Promise<T>): Promise<T> {
	const previousHome = process.env.HOME;
	const previousConfigDir = process.env.NEXUS_CONFIG_DIR;
	process.env.HOME = homeDir;
	process.env.NEXUS_CONFIG_DIR = join(homeDir, ".config", "nexus");
	try {
		return await callback();
	} finally {
		if (previousHome === undefined) delete process.env.HOME;
		else process.env.HOME = previousHome;
		if (previousConfigDir === undefined) delete process.env.NEXUS_CONFIG_DIR;
		else process.env.NEXUS_CONFIG_DIR = previousConfigDir;
	}
}

/**
 * Waits until the current millisecond offset is far from a second boundary.
 *
 * @returns Promise that resolves in the target millisecond window.
 */
async function waitForMiddleOfSecond(): Promise<void> {
	while (Date.now() % 1000 < 350 || Date.now() % 1000 > 650) await new Promise((resolve) => setTimeout(resolve, 20));
}

/**
 * Reads the latest skipped run start timestamp for one automation.
 *
 * @param automationId Automation id.
 * @returns Latest skipped run timestamp, or undefined.
 */
function readLatestSkippedRunStartedAt(automationId: string): string | undefined {
	return (withAutomationDatabase((db) => db.prepare("SELECT started_at FROM automation_runs WHERE automation_id = ? AND status = 'skipped' ORDER BY started_at DESC LIMIT 1").get(automationId)) as { started_at?: string } | undefined)?.started_at;
}

/**
 * Waits for a skipped automation run to be recorded.
 *
 * @param homeDir Isolated test home.
 * @param automationId Automation id.
 * @returns Skipped run start timestamp.
 */
async function waitForSkippedRunStartedAt(homeDir: string, automationId: string): Promise<string> {
	const deadline = Date.now() + 5000;
	while (Date.now() < deadline) {
		const startedAt = await withIsolatedAutomationHome(homeDir, () => readLatestSkippedRunStartedAt(automationId));
		if (startedAt) return startedAt;
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	throw new Error("Timed out waiting for skipped automation run");
}

/**
 * Waits for a spawned automation prompt process to write its captured prompt.
 *
 * @param capturePath File path written by the spawned test process.
 * @returns Captured prompt text.
 */
async function waitForCapturedPrompt(capturePath: string): Promise<string> {
	const deadline = Date.now() + 5000;
	while (Date.now() < deadline) {
		try {
			const lines = (await readFile(capturePath, "utf8")).trim().split("\n");
			const latest = JSON.parse(lines.at(-1) ?? "{}") as { prompt?: unknown };
			if (typeof latest.prompt === "string") return latest.prompt;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
		}
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	throw new Error("Timed out waiting for captured automation prompt");
}

test("source nexus automations help and status use configured SQLite path", async () => {
	const homeDir = await createReleaseTestHome();
	const dbPath = join(homeDir, "custom", "automations.sqlite");
	try {
		await mkdir(join(homeDir, ".config", "nexus"), { recursive: true });
		await writeFile(join(homeDir, ".config", "nexus", "config.json"), JSON.stringify({ miniApps: { automations: { dbPath } } }), "utf8");
		const help = await runAutomationsCli(homeDir, ["automations", "-h"]);
		assert.equal(help.code, 0);
		assert.match(help.output, /nexus automations create/u);
		assert.match(help.output, /nexus automations templates list/u);
		const status = await runAutomationsCli(homeDir, ["automations", "status"]);
		assert.equal(status.code, 0);
		assert.match(status.output, /Automations daemon: stopped/u);
		assert.match(status.output, new RegExp(dbPath.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

test("source nexus automations creates edits lists and deletes an automation", async () => {
	const homeDir = await createReleaseTestHome();
	try {
		const created = await runAutomationsCli(homeDir, ["automations", "create", "daily monitor", "--schedule", "every 4h", "--prompt", "Report status", "--cwd", process.cwd()]);
		assert.equal(created.code, 0);
		assert.match(created.output, /Created automation: daily monitor/u);
		const listed = await runAutomationsCli(homeDir, ["automations", "list"]);
		assert.match(listed.output, /daily monitor\tenabled\tevery 4h/u);
		const edited = await runAutomationsCli(homeDir, ["automations", "edit", "daily monitor", "--schedule", "daily", "--prompt", "Report daily status"]);
		assert.equal(edited.code, 0);
		const editedList = await runAutomationsCli(homeDir, ["automations", "list"]);
		assert.match(editedList.output, /daily monitor\tenabled\tdaily/u);
		const deleted = await runAutomationsCli(homeDir, ["automations", "delete", "daily monitor"]);
		assert.equal(deleted.code, 0);
		const empty = await runAutomationsCli(homeDir, ["automations", "list"]);
		assert.match(empty.output, /No automations found/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

test("source nexus automations templates list and use bundled templates", async () => {
	const homeDir = await createReleaseTestHome();
	try {
		const templates = await runAutomationsCli(homeDir, ["automations", "templates", "list"]);
		assert.equal(templates.code, 0);
		assert.match(templates.output, /ci-monitor\tCI Monitor/u);
		assert.match(templates.output, /daily-bug-scan\tDaily Bug Scan/u);
		const used = await runAutomationsCli(homeDir, ["automations", "templates", "use", "ci-monitor", "--name", "ci watch", "--schedule", "every 4h", "--yes"]);
		assert.equal(used.code, 0);
		assert.match(used.output, /Created automation from template: ci watch/u);
		const listed = await runAutomationsCli(homeDir, ["automations", "list"]);
		assert.match(listed.output, /ci watch\tenabled\tevery 4h/u);
	} finally {
		await removeReleaseTestHome(homeDir);
	}
});

test("source nexus automations prompt runs prefix the execution timestamp", async () => {
	const homeDir = await createReleaseTestHome();
	const capturePath = join(homeDir, "captured-prompt.jsonl");
	const runnerPath = join(homeDir, "capture-prompt-runner.mjs");
	const startedAt = "2026-05-11T12:34:56.789Z";
	const previousArgv1 = process.argv[1];
	const previousCapturePath = process.env.NEXUS_AUTOMATION_PROMPT_CAPTURE_PATH;
	try {
		await writeFile(runnerPath, `import { appendFileSync } from "node:fs";\nconst promptIndex = process.argv.indexOf("-p");\nappendFileSync(process.env.NEXUS_AUTOMATION_PROMPT_CAPTURE_PATH, JSON.stringify({ prompt: process.argv[promptIndex + 1] }) + "\\n");\n`, "utf8");
		process.argv[1] = runnerPath;
		process.env.NEXUS_AUTOMATION_PROMPT_CAPTURE_PATH = capturePath;
		await withIsolatedAutomationHome(homeDir, () => {
			const automation = createAutomation(buildAutomationInput("timestamp check", "daily", "hello", process.cwd(), true));
			const run = createAutomationRun({ automationId: automation.id, status: "running", startedAt, finishedAt: null, exitCode: null, pid: null, sessionPath: null, logPath: null, error: null });
			spawnAutomationPromptRun(automation, run);
		});
		assert.equal(await waitForCapturedPrompt(capturePath), `${startedAt} -- hello`);
	} finally {
		if (previousArgv1 === undefined) process.argv.splice(1, 1);
		else process.argv[1] = previousArgv1;
		if (previousCapturePath === undefined) delete process.env.NEXUS_AUTOMATION_PROMPT_CAPTURE_PATH;
		else process.env.NEXUS_AUTOMATION_PROMPT_CAPTURE_PATH = previousCapturePath;
		await removeReleaseTestHome(homeDir);
	}
});

test("source nexus automations starts reports and stops daemon", async () => {
	const homeDir = await createReleaseTestHome();
	try {
		const started = await runAutomationsCli(homeDir, ["automations", "start"]);
		assert.equal(started.code, 0);
		assert.match(started.output, /Started automations daemon/u);
		assert.match(started.output, /Automations daemon: running/u);
		const status = await runAutomationsCli(homeDir, ["automations", "status"]);
		assert.match(status.output, /Automations daemon: running/u);
		const stopped = await runAutomationsCli(homeDir, ["automations", "stop"]);
		assert.equal(stopped.code, 0);
		assert.match(stopped.output, /Stopped automations daemon/u);
		assert.match(stopped.output, /Automations daemon: stopped/u);
	} finally {
		await runAutomationsCli(homeDir, ["automations", "stop"]);
		await removeReleaseTestHome(homeDir);
	}
});

test("source nexus automations scheduler ticks on wall-clock boundaries", async () => {
	const homeDir = await createReleaseTestHome();
	try {
		const created = await runAutomationsCli(homeDir, ["automations", "create", "boundary check", "--schedule", "every 1m", "--prompt", "No-op", "--cwd", process.cwd()]);
		assert.equal(created.code, 0);
		await waitForMiddleOfSecond();
		const dueAt = new Date(Math.ceil(Date.now() / 1000) * 1000 + 2000).toISOString();
		const automationId = await withIsolatedAutomationHome(homeDir, () => {
			const automation = getAutomationByIdOrName("boundary check");
			assert.ok(automation);
			updateAutomationNextRunAt(automation.id, dueAt);
			createAutomationRun({ automationId: automation.id, status: "running", startedAt: new Date().toISOString(), finishedAt: null, exitCode: null, pid: null, sessionPath: null, logPath: null, error: null });
			return automation.id;
		});
		const started = await runAutomationsCli(homeDir, ["automations", "start"]);
		assert.equal(started.code, 0);
		const skippedStartedAt = await waitForSkippedRunStartedAt(homeDir, automationId);
		assert.ok(new Date(skippedStartedAt).getUTCMilliseconds() < 250);
	} finally {
		await runAutomationsCli(homeDir, ["automations", "stop"]);
		await removeReleaseTestHome(homeDir);
	}
});
