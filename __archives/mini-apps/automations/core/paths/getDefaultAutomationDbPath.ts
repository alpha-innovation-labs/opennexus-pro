import { join } from "node:path";
import { getAutomationRootPath } from "./getAutomationRootPath.js";

/**
 * Resolves the default automations SQLite database path.
 *
 * @returns Absolute SQLite database path.
 */
export function getDefaultAutomationDbPath(): string {
	return join(getAutomationRootPath(), "db", "automations.sqlite");
}
