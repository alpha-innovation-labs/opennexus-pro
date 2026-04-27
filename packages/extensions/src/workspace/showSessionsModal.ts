import { SessionManager, type ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { createPanelOverlayOptions } from "../overlay/createPanelOverlayOptions.js";
import { formatSessionLabel } from "./formatSessionLabel.js";
import { buildSessionDetailLines, WorkspaceSessionsModal } from "./WorkspaceSessionsModal.js";

/**
 * Shows the workspace sessions modal and switches to the picked session.
 *
 * @param ctx Command context.
 */
export async function showSessionsModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) return;
	const sessions = await SessionManager.list(ctx.cwd, ctx.sessionManager.getSessionDir());
	if (sessions.length === 0) {
		ctx.ui.notify("No sessions found", "warning");
		return;
	}

	const currentSessionPath = ctx.sessionManager.getSessionFile();
	const items: AutocompleteItem[] = sessions.map((session) => ({
		label: formatSessionLabel(session),
		value: session.path,
		description: currentSessionPath === session.path ? "current" : session.modified.toLocaleDateString(),
	}));
	const detailsByPath = new Map(sessions.map((session) => [session.path, buildSessionDetailLines(session, currentSessionPath)]));
	const sessionPath = await ctx.ui.custom<string | undefined>(
		(_tui, theme, _keybindings, done) => new WorkspaceSessionsModal(theme, items, detailsByPath, done),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%"),
		},
	);
	if (!sessionPath) return;
	await ctx.switchSession(sessionPath);
}
