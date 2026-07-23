import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { getAutomationDaemonLogPath } from "./getAutomationDaemonLogPath.js";
import { getAutomationDbPath } from "./getAutomationDbPath.js";
import { getAutomationRootPath } from "./getAutomationRootPath.js";

/**
 * Ensures automation data, database, and log directories exist.
 */
export function ensureAutomationRootDir(): void {
	mkdirSync(getAutomationRootPath(), { recursive: true });
	mkdirSync(dirname(getAutomationDbPath()), { recursive: true });
	mkdirSync(dirname(getAutomationDaemonLogPath()), { recursive: true });
}
