import type { TerminalState } from "../types.js";

/**
 * Marks one named terminal session as active.
 *
 * @param state Terminal extension state.
 * @param key Stable terminal key.
 */
export function setActiveTerminalSession(state: TerminalState, key: string): void {
	state.activeSessionKey = key;
}
