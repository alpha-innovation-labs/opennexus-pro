import { join } from "node:path";
import { getAutomationRootPath } from "./getAutomationRootPath.js";

/**
 * Resolves the daemon state-file path.
 *
 * @returns Absolute daemon state path.
 */
export function getAutomationStatePath(): string {
	return join(getAutomationRootPath(), "daemon.json");
}
