import { join } from "node:path";
import { getAutomationRootPath } from "./getAutomationRootPath.js";

/**
 * Resolves the daemon log path.
 *
 * @returns Absolute daemon log path.
 */
export function getAutomationDaemonLogPath(): string {
	return join(getAutomationRootPath(), "daemon.log");
}
