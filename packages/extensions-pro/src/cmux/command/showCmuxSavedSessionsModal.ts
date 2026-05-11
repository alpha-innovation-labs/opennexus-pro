import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { deleteCmuxSavedSession } from "../snapshots/deleteCmuxSavedSession.js";
import { listCmuxSavedSessions } from "../snapshots/listCmuxSavedSessions.js";
import { CmuxSavedSessionsModal } from "../ui/CmuxSavedSessionsModal.js";
import type { CmuxSavedSessionsAction } from "./CmuxWorkspaceShellAction.js";

/**
 * Opens the saved cmux sessions browser.
 *
 * @param ctx Extension command context.
 * @returns Saved-session browser action.
 */
export async function showCmuxSavedSessionsModal(ctx: ExtensionCommandContext): Promise<CmuxSavedSessionsAction> {
	const sessions = await listCmuxSavedSessions();
	return ctx.ui.custom<CmuxSavedSessionsAction>((tui, theme, _keybindings, done) => new CmuxSavedSessionsModal(
		theme,
		sessions,
		() => done("back"),
		(sessionId) => {
			void deleteCmuxSavedSession(sessionId);
			ctx.ui.notify("Deleted cmux session snapshot", "info");
		},
		() => tui.requestRender(),
	), {
		overlay: true,
		overlayOptions: createPanelOverlayOptions(110, "90%") as never,
	});
}
