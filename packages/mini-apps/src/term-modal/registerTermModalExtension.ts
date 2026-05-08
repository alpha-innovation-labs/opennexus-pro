import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "@nexus/extensions/slash-menu/withSlashMenuGroup.js";
import { registerConfiguredTermShortcuts } from "./keybindings/registerConfiguredTermShortcuts.js";
import { attachTerminalSession } from "./runtime/attachTerminalSession.js";
import { clearTerminalBuffer } from "./runtime/clearTerminalBuffer.js";
import { closeTerminalOverlay } from "./runtime/closeTerminalOverlay.js";
import { createTerminalState } from "./runtime/createTerminalState.js";
import { getActiveTerminalSession } from "./runtime/getActiveTerminalSession.js";
import { openTerminalOverlay } from "./runtime/openTerminalOverlay.js";
import { restartTerminal } from "./runtime/restartTerminal.js";
import { disposeTerminalSession } from "./runtime/disposeTerminalSession.js";

/**
 * Registers the local terminal modal extension commands and lifecycle hooks.
 *
 * @param pi Pi extension API.
 */
export function registerTermModalExtension(pi: ExtensionAPI): void {
	const state = createTerminalState();
	registerConfiguredTermShortcuts(pi, state, process.cwd());
	pi.on("session_start", async (_event, ctx) => {
		attachTerminalSession(state, ctx);
	});
	pi.on("session_shutdown", async () => {
		disposeTerminalSession(state);
	});
	pi.registerCommand("term", withSlashMenuGroup({
		description: "Open the persistent terminal in the floating modal UI.",
		handler: async (_args, ctx) => {
			await openTerminalOverlay(state, ctx, "main");
		},
	}, "Mini-Apps"));
	pi.registerCommand("term-restart", withSlashMenuGroup({
		description: "Restart the floating terminal shell.",
		handler: async (_args, ctx) => {
			if (restartTerminal(state, ctx.cwd)) {
				if (ctx.hasUI) ctx.ui.notify("Terminal restarted.", "info");
				getActiveTerminalSession(state).overlay?.refresh?.();
				return;
			}
			const session = getActiveTerminalSession(state);
			if (ctx.hasUI) ctx.ui.notify(`Terminal failed to start: ${session.pty.error()}`, "error");
		},
	}, "Mini-Apps"));
	pi.registerCommand("term-clear", withSlashMenuGroup({
		description: "Clear the floating terminal buffer.",
		handler: async (_args, ctx) => {
			clearTerminalBuffer(state);
			if (ctx.hasUI) ctx.ui.notify("Terminal buffer cleared.", "info");
		},
	}, "Mini-Apps"));
	pi.registerCommand("term-close", withSlashMenuGroup({
		description: "Close the floating terminal modal.",
		handler: async (_args, ctx) => {
			closeTerminalOverlay(state);
			if (ctx.hasUI) ctx.ui.notify("Terminal modal closed.", "info");
		},
	}, "Mini-Apps"));
}
