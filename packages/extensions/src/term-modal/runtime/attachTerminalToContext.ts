import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { TerminalSessionState } from "../types.js";

/**
 * Attaches PTY listeners for one named terminal session.
 *
 * @param session Terminal session state.
 * @param ctx Interactive extension context.
 */
export function attachTerminalToContext(session: TerminalSessionState, ctx: ExtensionContext): void {
	session.ctx = ctx;
	session.sessionCwd = ctx.cwd;
	session.unsubData?.();
	session.unsubExit?.();
	session.unsubData = session.pty.onData((data) => {
		session.xterm?.write(data);
		session.overlay?.refresh?.();
	});
	session.unsubExit = session.pty.onExit(() => {
		if (ctx.hasUI) {
			ctx.ui.notify(`${session.title} shell exited.`, "warning");
		}
		session.overlay?.refresh?.();
	});
}
