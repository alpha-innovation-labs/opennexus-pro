import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Resolves the installed Nexus auth.json target path.
 *
 * @returns {string} Absolute Nexus auth.json path.
 */
export function resolveNexusAuthTargetPath() {
	const agentDir =
		process.env.NEXUS_CODING_AGENT_DIR?.trim() ||
		join(homedir(), ".local", "share", "nexus", "agent");
	return join(agentDir, "auth.json");
}
