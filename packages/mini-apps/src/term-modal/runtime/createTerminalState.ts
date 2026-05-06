import type { TerminalState } from "../types.js";

/**
 * Creates mutable runtime state for the terminal modal extension.
 *
 * @returns Fresh terminal extension state.
 */
export function createTerminalState(): TerminalState {
	return {
		sessions: new Map(),
		activeSessionKey: "main",
	};
}
