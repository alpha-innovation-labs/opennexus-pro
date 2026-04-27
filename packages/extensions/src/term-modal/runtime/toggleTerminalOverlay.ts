import type { ExtensionCommandContext, ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { TerminalState } from "../types.js";
import { getTerminalSession } from "./getTerminalSession.js";
import { hideTerminalOverlay } from "./hideTerminalOverlay.js";
import { openTerminalOverlay } from "./openTerminalOverlay.js";
import { setActiveTerminalSession } from "./setActiveTerminalSession.js";

/**
 * Toggles the main floating terminal overlay between hidden and visible states.
 *
 * @param state Terminal extension state.
 * @param ctx Interactive extension context.
 */
export async function toggleTerminalOverlay(
	state: TerminalState,
	ctx: ExtensionCommandContext | ExtensionContext,
): Promise<void> {
	setActiveTerminalSession(state, "main");
	const session = getTerminalSession(state, "main");
	session.sessionCwd = ctx.cwd;
	if (!session.overlay?.handle) {
		await openTerminalOverlay(state, ctx, "main");
		return;
	}
	if (session.overlay.handle.isHidden()) {
		await openTerminalOverlay(state, ctx, "main");
		return;
	}
	hideTerminalOverlay(state);
}
