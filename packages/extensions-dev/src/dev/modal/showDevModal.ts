import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { createDevModalVariations } from "./createDevModalVariations.js";
import { DevModal } from "./DevModal.js";

/**
 * Opens the dev modal as a floating overlay.
 *
 * @param ctx Extension command context.
 */
export async function showDevModal(ctx: ExtensionContext): Promise<void> {
  if (!ctx.hasUI) {
    ctx.ui.notify("/dev-modal requires an interactive UI session.", "warning");
    return;
  }

  await ctx.ui.custom<void>((tui, theme, _keybindings, done) => {
    return new DevModal({
      fullScreenRows: () => tui.terminal.rows,
      onClose: done,
      onRenderNeeded: () => tui.requestRender(),
      theme,
      variations: createDevModalVariations(),
    });
  }, {
    overlay: true,
    overlayOptions: createPanelOverlayOptions(50, "100%"),
  });
}
