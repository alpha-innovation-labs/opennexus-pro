import type { TerminalState } from "../types.js";
import { closeTerminalOverlay } from "./closeTerminalOverlay.js";

/**
 * Tears down listeners, overlays, and PTYs for all terminal sessions.
 *
 * @param state Terminal extension state.
 */
export function disposeTerminalSession(state: TerminalState): void {
	for (const session of state.sessions.values()) {
		session.unsubData?.();
		session.unsubExit?.();
		session.unsubData = null;
		session.unsubExit = null;
		closeTerminalOverlay(state, session.key);
		session.pty.kill();
		session.xterm = null;
		session.ctx = null;
	}
	state.sessions.clear();
	state.activeSessionKey = "main";
}
