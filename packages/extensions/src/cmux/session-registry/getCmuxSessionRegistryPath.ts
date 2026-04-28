import { tmpdir } from "node:os";
import { join } from "node:path";

const CMUX_SESSION_REGISTRY_ENV = "NEXUS_CMUX_SESSION_REGISTRY";

/**
 * Resolves the shared cmux-to-Nexus session registry path.
 *
 * @returns Absolute registry file path.
 */
export function getCmuxSessionRegistryPath(): string {
	return process.env[CMUX_SESSION_REGISTRY_ENV]?.trim() || join(tmpdir(), `nexus-cmux-sessions-${process.getuid?.() ?? "user"}.json`);
}
