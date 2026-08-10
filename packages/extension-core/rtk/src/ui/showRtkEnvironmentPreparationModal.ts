import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { SharedModal } from "@nexus/tui-kit/modal/index";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";

/**
 * Shows a small environment preparation overlay while RTK is being prepared.
 *
 * @param ctx Extension context.
 * @returns Function that closes the overlay.
 */
export function showRtkEnvironmentPreparationModal(ctx: ExtensionContext): () => void {
  if (!ctx.hasUI) return () => undefined;

  let close = () => undefined;
  void ctx.ui.custom<void>((_tui, theme, _keybindings, done) => {
    close = done;
    return new SharedModal({
      theme,
      minWidth: 52,
      maxWidthRatio: 0.5,
      headerLines: [theme.fg("accent", "Preparing environment")],
      panes: [{ id: "body", size: 1, lines: ["Nexus is preparing local command tooling.", theme.fg("muted", "This usually takes a moment on first run.")] }],
      footerLines: [theme.fg("muted", "Please wait…")],
      onClose: () => undefined,
    });
  }, {
    overlay: true,
    overlayOptions: createPanelOverlayOptions(52, "40%"),
  }).catch(() => undefined);

  return () => close();
}
