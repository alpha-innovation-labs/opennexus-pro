import { join } from "node:path";
import { getNexusAgentDirPath } from "@nexus/runtime";

const CMUX_SESSION_REGISTRY_ENV = "NEXUS_CMUX_SESSION_REGISTRY";

/**
 * Resolves the shared cmux-to-Nexus session registry path.
 *
 * @returns Absolute registry file path.
 */
export function getCmuxSessionRegistryPath(): string {
	return (
		process.env[CMUX_SESSION_REGISTRY_ENV]?.trim() ||
		join(getNexusAgentDirPath(), "cmux-session-registry.json")
	);
}
