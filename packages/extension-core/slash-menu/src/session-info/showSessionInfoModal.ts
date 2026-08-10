import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { createSessionInfoRows } from "./createSessionInfoRows.js";
import { SessionInfoModal } from "./SessionInfoModal.js";

/**
 * Opens the Nexus-owned current session info modal.
 *
 * @param ctx Extension context.
 */
export async function showSessionInfoModal(ctx: ExtensionContext): Promise<void> {
  await ctx.ui.custom<void>((_tui, theme, _keybindings, done) => new SessionInfoModal(theme, createSessionInfoRows(ctx), done), {
    overlay: true,
    overlayOptions: createPanelOverlayOptions(72),
  });
}
