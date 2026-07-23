import { existsSync, readFileSync } from "node:fs";
import { getAutomationHeartbeatPath } from "../paths/getAutomationHeartbeatPath.js";
import type { AutomationDaemonHeartbeat } from "./types.js";

/**
 * Reads the latest daemon heartbeat from disk.
 *
 * @returns Heartbeat payload, or null when missing.
 */
export function readAutomationHeartbeat(): AutomationDaemonHeartbeat | null {
	const path = getAutomationHeartbeatPath();
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, "utf8")) as AutomationDaemonHeartbeat;
	} catch {
		return null;
	}
}
