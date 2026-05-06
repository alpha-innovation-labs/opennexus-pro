import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { TerminalState } from "../types.js";
import { attachTerminalToContext } from "./attachTerminalToContext.js";

/**
 * Attaches PTY listeners for all existing terminal sessions.
 *
 * @param state Terminal extension state.
 * @param ctx Interactive extension context.
 */
export function attachTerminalSession(state: TerminalState, ctx: ExtensionContext): void {
	for (const session of state.sessions.values()) {
		attachTerminalToContext(session, ctx);
	}
}
