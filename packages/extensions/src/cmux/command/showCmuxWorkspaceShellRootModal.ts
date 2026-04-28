import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "../../overlay/createPanelOverlayOptions.js";
import { CmuxWorkspaceShellsModal } from "../ui/CmuxWorkspaceShellsModal.js";
import { getCachedCmuxWorkspaceShellLines } from "../workspace-cache/getCachedCmuxWorkspaceShellLines.js";
import { refreshCmuxWorkspaceShellLinesCache } from "../workspace-cache/refreshCmuxWorkspaceShellLinesCache.js";
import type { CmuxWorkspaceShellAction } from "./CmuxWorkspaceShellAction.js";

/**
 * Opens the root cmux workspace shell modal and returns the selected action.
 *
 * @param ctx Extension command context.
 * @returns Selected workspace shell action.
 */
export async function showCmuxWorkspaceShellRootModal(ctx: ExtensionCommandContext): Promise<CmuxWorkspaceShellAction | undefined> {
	return ctx.ui.custom<CmuxWorkspaceShellAction | undefined>((tui, theme, _keybindings, done) => {
		const cachedLines = getCachedCmuxWorkspaceShellLines();
		const modal = new CmuxWorkspaceShellsModal(
			theme,
			cachedLines ?? [theme.fg("dim", "Loading workspaces…")],
			() => done(undefined),
			() => done("save"),
			() => done("load"),
		);
		void refreshCmuxWorkspaceShellLinesCache(Boolean(cachedLines))
			.then((lines) => {
				modal.setLines(lines);
				tui.requestRender();
			})
			.catch((error) => {
				modal.setLines([`Failed to load cmux workspaces: ${error instanceof Error ? error.message : String(error)}`]);
				tui.requestRender();
			});
		return modal;
	}, {
		overlay: true,
		overlayOptions: createPanelOverlayOptions(96, "85%") as never,
	});
}
