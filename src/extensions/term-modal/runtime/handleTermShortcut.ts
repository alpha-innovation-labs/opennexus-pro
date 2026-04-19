import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { TermShortcutBinding, TerminalState } from "../types.js";
import { getTerminalSession } from "./getTerminalSession.js";
import { openTerminalOverlay } from "./openTerminalOverlay.js";
import { toTerminalCommandInput } from "./toTerminalCommandInput.js";
import { toggleTerminalOverlay } from "./toggleTerminalOverlay.js";

/**
 * Executes one configured terminal shortcut.
 *
 * @param state Terminal extension state.
 * @param binding Parsed shortcut binding.
 * @param ctx Interactive extension context.
 */
export async function handleTermShortcut(
	state: TerminalState,
	binding: TermShortcutBinding,
	ctx: ExtensionContext,
): Promise<void> {
	if (!binding.command) {
		await toggleTerminalOverlay(state, ctx);
		return;
	}
	const session = getTerminalSession(state, binding.name);
	session.sessionCwd = ctx.cwd;
	await openTerminalOverlay(state, ctx, binding.name);
	session.pty.write(toTerminalCommandInput(binding.command));
}
