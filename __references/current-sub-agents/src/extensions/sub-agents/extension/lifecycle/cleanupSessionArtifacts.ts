import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { cleanupOldArtifacts, getArtifactsDir } from "../../vendor/artifacts.js";
import { DEFAULT_ARTIFACT_CONFIG } from "../../vendor/types.js";

/**
 * Cleans expired artifacts for the current session.
 *
 * @param ctx Pi extension context.
 */
export function cleanupSessionArtifacts(ctx: ExtensionContext): void {
	try {
		const sessionFile = ctx.sessionManager.getSessionFile();
		if (sessionFile) cleanupOldArtifacts(getArtifactsDir(sessionFile), DEFAULT_ARTIFACT_CONFIG.cleanupDays);
	} catch {
		// Cleanup failures should never block session lifecycle events.
	}
}
