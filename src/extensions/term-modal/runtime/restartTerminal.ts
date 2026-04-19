import type { TerminalState } from "../types.js";
import { ensureTerminalStarted } from "./ensureTerminalStarted.js";
import { getActiveTerminalSession } from "./getActiveTerminalSession.js";

/**
 * Restarts the PTY shell for the active terminal session.
 *
 * @param state Terminal extension state.
 * @param cwd Working directory for the replacement shell.
 * @returns True when restart succeeds.
 */
export function restartTerminal(state: TerminalState, cwd: string): boolean {
	const session = getActiveTerminalSession(state);
	session.pty.kill();
	session.pty.clearError();
	session.sessionCwd = cwd;
	return ensureTerminalStarted(session, cwd);
}
