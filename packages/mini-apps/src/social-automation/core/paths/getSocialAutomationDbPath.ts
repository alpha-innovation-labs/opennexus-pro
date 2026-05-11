import { join } from "node:path";
import { getSocialAutomationRootPath } from "./getSocialAutomationRootPath.js";

/**
 * Resolves the SQLite database path for social automation.
 *
 * @param overridePath Optional CLI override path.
 * @returns Absolute or caller-provided database path.
 */
export function getSocialAutomationDbPath(overridePath?: string): string {
	return overridePath ?? join(getSocialAutomationRootPath(), "db.sqlite");
}
