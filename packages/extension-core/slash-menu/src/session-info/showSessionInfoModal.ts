import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import { createSessionInfoRows } from "./createSessionInfoRows";
import { SessionInfoModal } from "./SessionInfoModal";

/**
 * Opens the Nexus-owned current session info modal.
 *
 * @param ctx Extension context.
 */
export async function showSessionInfoModal(
	ctx: ExtensionContext,
): Promise<void> {
	await ctx.ui.custom<void>(
		(_tui, theme, _keybindings, done) =>
			new SessionInfoModal(theme, createSessionInfoRows(ctx), done),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(72),
		},
	);
}
