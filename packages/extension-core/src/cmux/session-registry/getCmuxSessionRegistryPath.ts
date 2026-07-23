import { getAgentDirPath } from "@nexus/runtime/config/getAgentDirPath.js";
import { join } from "node:path";

const CMUX_SESSION_REGISTRY_ENV = "NEXUS_CMUX_SESSION_REGISTRY";

/**
 * Resolves the shared cmux-to-Nexus session registry path.
 *
 * @returns Absolute registry file path.
 */
export function getCmuxSessionRegistryPath(): string {
	return process.env[CMUX_SESSION_REGISTRY_ENV]?.trim() || join(getAgentDirPath(), "cmux-session-registry.json");
}
