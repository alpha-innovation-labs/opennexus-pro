import { createPtyManager } from "../pty/createPtyManager.js";
import type { TerminalSessionState } from "../types.js";

/**
 * Creates mutable state for one named terminal session.
 *
 * @param key Stable session key.
 * @returns Fresh terminal session state.
 */
export function createTerminalSessionState(key: string): TerminalSessionState {
	return {
		key,
		title: key === "main" ? "Terminal" : `Terminal · ${key}`,
		xterm: null,
		pty: createPtyManager(),
		sessionCwd: process.cwd(),
		overlay: null,
		unsubData: null,
		unsubExit: null,
		ctx: null,
	};
}
