import { createXtermBuffer } from "../buffer/createXtermBuffer.js";
import type { TerminalSessionState } from "../types.js";

/**
 * Starts one PTY shell and display buffer when needed.
 *
 * @param session Terminal session state.
 * @param cwd Working directory for the shell session.
 * @returns True when the shell is available.
 */
export function ensureTerminalStarted(session: TerminalSessionState, cwd: string): boolean {
	if (session.pty.isRunning()) return true;
	if (session.pty.error()) return false;
	const cols = Math.max(80, (process.stdout.columns ?? 120) - 8);
	const rows = Math.max(12, Math.floor((process.stdout.rows ?? 40) * 0.65) - 6);
	if (!session.xterm) {
		session.xterm = createXtermBuffer(cols, rows, (data) => session.pty.write(data));
	}
	session.sessionCwd = cwd;
	session.pty.start(cwd, cols, rows);
	return session.pty.isRunning();
}
