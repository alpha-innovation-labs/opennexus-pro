import { getAutomationDaemonLogPath } from "../paths/getAutomationDaemonLogPath.js";
import { getAutomationDbPath } from "../paths/getAutomationDbPath.js";
import { getAutomationStatePath } from "../paths/getAutomationStatePath.js";
import { isProcessAlive } from "../process/isProcessAlive.js";
import { readAutomationDaemonState } from "./readAutomationDaemonState.js";
import { readAutomationHeartbeat } from "./readAutomationHeartbeat.js";
import type { AutomationDaemonStatus } from "./types.js";

/**
 * Reads the current automation daemon status.
 *
 * @returns Daemon status summary.
 */
export function getAutomationDaemonStatus(): AutomationDaemonStatus {
	const state = readAutomationDaemonState();
	const heartbeat = readAutomationHeartbeat();
	const running = state ? isProcessAlive(state.pid) : false;
	return {
		running,
		pid: running && state ? state.pid : null,
		startedAt: running && state ? state.startedAt : null,
		heartbeatAt: running && heartbeat ? heartbeat.updatedAt : null,
		statePath: getAutomationStatePath(),
		logPath: getAutomationDaemonLogPath(),
		dbPath: getAutomationDbPath(),
	};
}
