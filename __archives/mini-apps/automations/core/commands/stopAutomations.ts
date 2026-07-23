import { waitForProcessExit } from "../process/waitForProcessExit.js";
import { clearAutomationDaemonState } from "../state/clearAutomationDaemonState.js";
import { getAutomationDaemonStatus } from "../state/getAutomationDaemonStatus.js";
import type { AutomationDaemonStatus } from "../state/types.js";

/** Result from stopping the automations daemon. */
export type StopAutomationsResult = { stopped: boolean; status: AutomationDaemonStatus };

/**
 * Stops the automations daemon if it is running.
 *
 * @returns Stop result and status.
 */
export async function stopAutomations(): Promise<StopAutomationsResult> {
	const status = getAutomationDaemonStatus();
	if (!status.running || !status.pid) return { stopped: false, status };
	process.kill(status.pid, "SIGTERM");
	const stopped = await waitForProcessExit(status.pid, 5000);
	if (stopped) clearAutomationDaemonState();
	return { stopped, status: getAutomationDaemonStatus() };
}
