import type { TerminalSessionState, TerminalState } from "../types.js";
import { getTerminalSession } from "./getTerminalSession.js";

/**
 * Returns the currently active terminal session.
 *
 * @param state Terminal extension state.
 * @returns Active terminal session state.
 */
export function getActiveTerminalSession(state: TerminalState): TerminalSessionState {
	return getTerminalSession(state, state.activeSessionKey);
}
