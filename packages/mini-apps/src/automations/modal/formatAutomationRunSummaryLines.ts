import { basename } from "node:path";
import type { AutomationRunRecord } from "../core/storage/types.js";
import { formatAutomationRunTime } from "./formatAutomationRunTime.js";

/**
 * Formats one latest run as two summary lines.
 *
 * @param run Automation run record.
 * @param index One-based run index.
 * @returns Two summary lines for the run.
 */
export function formatAutomationRunSummaryLines(run: AutomationRunRecord | undefined, index: number): string[] {
	if (!run) return [`Last run ${index}: none recorded`, "  no run details"];
	const started = formatAutomationRunTime(run.startedAt, true);
	const finished = run.finishedAt ? formatAutomationRunTime(run.finishedAt, false) : "running";
	const exit = run.exitCode === null ? "exit=n/a" : `exit=${run.exitCode}`;
	const location = run.logPath ? `log=${basename(run.logPath)}` : "log=n/a";
	const error = run.error ? `err=${run.error}` : "err=none";
	return [`Last run ${index}: ${run.status} · ${started} → ${finished}`, `  ${exit} · ${location} · ${error}`];
}
