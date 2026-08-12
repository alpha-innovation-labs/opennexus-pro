import { join } from "node:path";
import { getNexusAgentDirPath } from "@nexus/runtime";

const CMUX_SAVED_SESSIONS_ENV = "NEXUS_CMUX_SAVED_SESSIONS";

/**
 * Resolves the cmux saved-session store path.
 *
 * @returns Saved-session JSON file path.
 */
export function getCmuxSavedSessionsPath(): string {
	return (
		process.env[CMUX_SAVED_SESSIONS_ENV]?.trim() ||
		join(getNexusAgentDirPath(), "cmux-sessions.json")
	);
}
