import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { restoreSlashFinalSnapshots } from "../../vendor/slash-live-state.js";
import type { SubagentState } from "../../vendor/types.js";
import { cleanupSessionArtifacts } from "./cleanupSessionArtifacts.js";

/**
 * Resets session-scoped runtime state when a Pi session starts.
 *
 * @param state Mutable extension state.
 * @param resetJobs Async-job reset callback.
 * @param ctx Pi extension context.
 */
export function resetSessionState(
	state: SubagentState,
	resetJobs: (ctx: ExtensionContext) => void,
	ctx: ExtensionContext,
): void {
	state.baseCwd = ctx.cwd;
	state.currentSessionId = ctx.sessionManager.getSessionFile() ?? `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	state.lastUiContext = ctx;
	cleanupSessionArtifacts(ctx);
	resetJobs(ctx);
	restoreSlashFinalSnapshots(ctx.sessionManager.getEntries());
}
