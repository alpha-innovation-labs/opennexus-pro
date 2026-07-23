import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getAutomationHeartbeatPath } from "../paths/getAutomationHeartbeatPath.js";
import type { AutomationDaemonHeartbeat } from "./types.js";

/**
 * Writes the current daemon heartbeat to disk.
 */
export function writeAutomationHeartbeat(): void {
	const heartbeat: AutomationDaemonHeartbeat = { pid: process.pid, updatedAt: new Date().toISOString() };
	const path = getAutomationHeartbeatPath();
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(heartbeat, null, 2)}\n`, "utf8");
}
