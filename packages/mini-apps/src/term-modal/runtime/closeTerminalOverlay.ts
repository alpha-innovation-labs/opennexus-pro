import type { TerminalState } from "../types.js";
import { getTerminalSession } from "./getTerminalSession.js";

/**
 * Closes one terminal overlay and clears its runtime handle.
 *
 * @param state Terminal extension state.
 * @param terminalKey Named terminal session key.
 */
export function closeTerminalOverlay(state: TerminalState, terminalKey = state.activeSessionKey): void {
	const session = getTerminalSession(state, terminalKey);
	session.overlay?.close?.();
	session.overlay = null;
}
