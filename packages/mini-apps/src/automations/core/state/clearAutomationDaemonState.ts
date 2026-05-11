import { rmSync } from "node:fs";
import { getAutomationHeartbeatPath } from "../paths/getAutomationHeartbeatPath.js";
import { getAutomationStatePath } from "../paths/getAutomationStatePath.js";

/**
 * Removes daemon state and heartbeat files.
 */
export function clearAutomationDaemonState(): void {
	rmSync(getAutomationStatePath(), { force: true });
	rmSync(getAutomationHeartbeatPath(), { force: true });
}
