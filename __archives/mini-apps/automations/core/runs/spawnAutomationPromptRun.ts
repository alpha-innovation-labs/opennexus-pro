import { spawn } from "node:child_process";
import { mkdirSync, openSync } from "node:fs";
import { dirname } from "node:path";
import { getCurrentNexusLaunchSpec } from "@nexus/runtime/cli/getCurrentNexusLaunchSpec.js";
import { getAutomationRunLogPath } from "../paths/getAutomationRunLogPath.js";
import { buildTimestampedAutomationPrompt } from "./buildTimestampedAutomationPrompt.js";
import type { AutomationRecord, AutomationRunRecord } from "../storage/types.js";
import { updateAutomationRun } from "../storage/updateAutomationRun.js";

/**
 * Spawns a Nexus prompt run for one automation.
 *
 * @param automation Automation to execute.
 * @param run Running run record to update.
 */
export function spawnAutomationPromptRun(automation: AutomationRecord, run: AutomationRunRecord): void {
	const prompt = buildTimestampedAutomationPrompt(run.startedAt, automation.prompt);
	const { command, args } = getCurrentNexusLaunchSpec(["-p", prompt]);
	const logPath = getAutomationRunLogPath(run.id);
	mkdirSync(dirname(logPath), { recursive: true });
	const logFd = openSync(logPath, "a");
	const child = spawn(command, args, { cwd: automation.cwd, env: process.env, stdio: ["ignore", logFd, logFd] });
	const running = { ...run, pid: child.pid ?? null, logPath };
	updateAutomationRun(running);
	child.on("error", (error) => finishAutomationRun(running, "failed", null, error.message));
	child.on("close", (code) => finishAutomationRun(running, code === 0 ? "success" : "failed", code, null));
}

/**
 * Finalizes a spawned automation run.
 *
 * @param run Run record to finalize.
 * @param status Terminal run status.
 * @param exitCode Process exit code.
 * @param error Error message, when any.
 */
function finishAutomationRun(run: AutomationRunRecord, status: "success" | "failed", exitCode: number | null, error: string | null): void {
	updateAutomationRun({ ...run, status, exitCode, error, finishedAt: new Date().toISOString() });
}
