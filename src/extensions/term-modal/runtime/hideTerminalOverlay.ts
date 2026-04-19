import type { TerminalState } from "../types.js";
import { getActiveTerminalSession } from "./getActiveTerminalSession.js";

/**
 * Temporarily hides the active terminal overlay without destroying it.
 *
 * @param state Terminal extension state.
 */
export function hideTerminalOverlay(state: TerminalState): void {
	const session = getActiveTerminalSession(state);
	if (!session.overlay?.handle) return;
	session.overlay.handle.setHidden(true);
	session.overlay.handle.unfocus();
}
