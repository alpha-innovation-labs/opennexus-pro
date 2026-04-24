import { homedir } from "node:os";
import { join } from "node:path";
import { expandHomePath } from "../../runtime/config/expandHomePath.js";

/**
 * Resolves the Nexus-only agent directory for usage auth reads.
 *
 * @returns Nexus agent directory path.
 */
export function getNexusAgentDirPath(): string {
	const configuredPath = process.env.NEXUS_CODING_AGENT_DIR;
	return configuredPath ? expandHomePath(configuredPath) : join(homedir(), ".local", "share", "nexus", "agent");
}
