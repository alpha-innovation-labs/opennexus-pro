import { join } from "node:path";
import { getAutomationRootPath } from "./getAutomationRootPath.js";

/**
 * Resolves an automation run log path.
 *
 * @param runId Automation run id.
 * @returns Absolute run log path.
 */
export function getAutomationRunLogPath(runId: string): string {
	return join(getAutomationRootPath(), "runs", `${runId}.log`);
}
