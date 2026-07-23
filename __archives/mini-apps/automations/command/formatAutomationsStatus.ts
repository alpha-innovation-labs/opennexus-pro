import type { AutomationsStatus } from "../core/commands/getAutomationsStatus.js";

/**
 * Formats automations status for CLI output.
 *
 * @param status Status payload.
 * @returns Human-readable status text.
 */
export function formatAutomationsStatus(status: AutomationsStatus): string {
	const lines = [
		`Automations daemon: ${status.daemon.running ? "running" : "stopped"}`,
		`PID: ${status.daemon.pid ?? "none"}`,
		`Database: ${status.daemon.dbPath}`,
		`Log: ${status.daemon.logPath}`,
		`Automations: ${status.automationCount}`,
		`Active runs: ${status.activeRunCount}`,
		"Next:",
		...status.nextAutomations.map((automation) => `  ${automation.name} at ${automation.nextRunAt}`),
		"Latest failures:",
		...status.latestFailures.map((run) => `  ${run.automationId} ${run.startedAt} ${run.error ?? "failed"}`),
	];
	return lines.join("\n");
}
