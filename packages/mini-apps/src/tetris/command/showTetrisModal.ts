import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/extensions/overlay/createPanelOverlayOptions.js";
import { getTetrisSession } from "../game/tetrisSession.js";
import { TetrisModal } from "../ui/TetrisModal.js";

/**
 * Opens the shared Tetris full-screen modal.
 *
 * @param ctx Pi command context.
 */
export async function showTetrisModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) return;
	await ctx.ui.custom<void>(
		(tui, theme, _keybindings, done) => new TetrisModal(tui, theme, getTetrisSession(), () => done()),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(116, "90%", { widthMode: "modal" }) as never,
		},
	);
}
