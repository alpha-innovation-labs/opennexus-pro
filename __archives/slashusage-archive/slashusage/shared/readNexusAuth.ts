import { join } from "node:path";
import { getNexusAgentDirPath } from "./getNexusAgentDirPath.js";
import { readJsonFile } from "./readJsonFile.js";

/**
 * Reads Nexus auth storage from disk.
 *
 * @returns Parsed Nexus auth payload.
 */
export function readNexusAuth(): Record<string, unknown> | undefined {
	return readJsonFile(join(getNexusAgentDirPath(), "auth.json"));
}
