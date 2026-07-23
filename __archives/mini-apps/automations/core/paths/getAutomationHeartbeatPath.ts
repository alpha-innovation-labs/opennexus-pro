import { join } from "node:path";
import { getAutomationRootPath } from "./getAutomationRootPath.js";

/**
 * Resolves the daemon heartbeat-file path.
 *
 * @returns Absolute heartbeat path.
 */
export function getAutomationHeartbeatPath(): string {
	return join(getAutomationRootPath(), "heartbeat.json");
}
