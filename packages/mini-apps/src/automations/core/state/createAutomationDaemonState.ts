import type { AutomationDaemonState } from "./types.js";

/**
 * Creates a daemon state payload for the current process.
 *
 * @param pid Daemon process id.
 * @returns Serializable daemon state.
 */
export function createAutomationDaemonState(pid: number): AutomationDaemonState {
	return { pid, startedAt: new Date().toISOString() };
}
