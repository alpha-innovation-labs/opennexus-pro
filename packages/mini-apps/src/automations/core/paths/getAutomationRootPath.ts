import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Resolves the default Nexus automations data directory.
 *
 * @returns Absolute automations data directory path.
 */
export function getAutomationRootPath(): string {
	return join(homedir(), ".local", "share", "nexus", "automations");
}
