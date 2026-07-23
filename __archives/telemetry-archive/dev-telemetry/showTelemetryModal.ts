import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { TelemetryModal } from "./TelemetryModal.js";

/**
 * Opens the dev-only telemetry event toggle modal.
 *
 * @param ctx Extension command context.
 */
export async function showTelemetryModal(ctx: ExtensionContext): Promise<void> {
  if (!ctx.hasUI) {
    ctx.ui.notify("/telemetry requires an interactive UI session.", "warning");
    return;
  }

  await ctx.ui.custom<void>((_tui, theme, _keybindings, done) => new TelemetryModal(theme, done), {
    overlay: true,
    overlayOptions: createPanelOverlayOptions(70, "90%"),
  });
}
