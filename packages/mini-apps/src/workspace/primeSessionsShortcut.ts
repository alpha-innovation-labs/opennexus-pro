import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { ensureSubmitTrigger } from "@nexus/extensions/neo-editor/features/editor-triggers/ensureSubmitTrigger.js";

const SESSIONS_COMMAND_TEXT = "/sessions";

/**
 * Prepares the editor so the workspace sessions command auto-submits.
 *
 * @param ctx Extension shortcut context.
 */
export async function primeSessionsShortcut(ctx: ExtensionContext): Promise<void> {
	if (!ctx.hasUI) return;
	// Shortcuts do not get command context, so they cannot switch sessions directly.
	// We prime Neo to auto-submit `/sessions`, which then runs as a real command.
	await ensureSubmitTrigger(ctx.cwd, SESSIONS_COMMAND_TEXT);
	ctx.ui.setEditorText(SESSIONS_COMMAND_TEXT);
}
