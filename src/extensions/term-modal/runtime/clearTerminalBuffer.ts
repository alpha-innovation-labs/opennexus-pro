import type { TerminalState } from "../types.js";
import { getActiveTerminalSession } from "./getActiveTerminalSession.js";

/**
 * Clears the rendered scrollback buffer for the active terminal session.
 *
 * @param state Terminal extension state.
 */
export function clearTerminalBuffer(state: TerminalState): void {
	const session = getActiveTerminalSession(state);
	session.xterm?.clear();
	session.overlay?.refresh?.();
}
