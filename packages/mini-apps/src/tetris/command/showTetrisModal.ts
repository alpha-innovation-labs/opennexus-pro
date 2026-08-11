import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import { getTetrisSession } from "../game/tetrisSession";
import { TetrisModal } from "../ui/TetrisModal";

/**
 * Opens the shared Tetris full-screen modal.
 *
 * @param ctx Pi command context.
 */
export async function showTetrisModal(
	ctx: ExtensionCommandContext,
): Promise<void> {
	if (!ctx.hasUI) return;
	await ctx.ui.custom<void>(
		(tui, theme, _keybindings, done) =>
			new TetrisModal(tui, theme, getTetrisSession(), () => done()),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(116, "100%") as never,
		},
	);
}
