import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Resolves the default social automation data directory.
 *
 * @returns Absolute root data directory path.
 */
export function getSocialAutomationRootPath(): string {
	return join(homedir(), ".local", "share", "nexus", "social-automation");
}
