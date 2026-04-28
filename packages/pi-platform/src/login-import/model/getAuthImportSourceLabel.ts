import type { AuthImportSource } from "./AuthImportSource.js";

/**
 * Formats an auth import source name for UI messages.
 *
 * @param source Import source identifier.
 * @returns Human-readable source label.
 */
export function getAuthImportSourceLabel(source: AuthImportSource): string {
	return source === "pi" ? "Pi" : "OpenCode";
}
