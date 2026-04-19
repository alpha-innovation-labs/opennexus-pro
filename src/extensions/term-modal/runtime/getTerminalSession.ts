import type { TerminalSessionState, TerminalState } from "../types.js";
import { createTerminalSessionState } from "./createTerminalSessionState.js";

/**
 * Returns one named terminal session, creating it on first access.
 *
 * @param state Terminal extension state.
 * @param key Stable terminal key.
 * @returns Named terminal session state.
 */
export function getTerminalSession(state: TerminalState, key: string): TerminalSessionState {
	let session = state.sessions.get(key);
	if (!session) {
		session = createTerminalSessionState(key);
		state.sessions.set(key, session);
	}
	return session;
}
