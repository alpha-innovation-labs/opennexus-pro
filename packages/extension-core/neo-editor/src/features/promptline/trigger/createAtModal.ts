import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { AutocompleteItem } from "@earendil-works/pi-tui";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import { AtModal } from "../AtModal";
import type { TriggerModalHandle, ShowOverlay } from "./types";

/**
 * Creates and shows the `@` trigger modal.
 *
 * @param ctx Extension context.
 * @param uiTheme UI theme.
 * @param onPick Pick handler.
 * @param onClose Close handler.
 * @param requestRender Render callback.
 * @param showOverlay Overlay factory.
 * @returns At modal and handle.
 */
export function createAtModal(
  ctx: ExtensionContext,
  uiTheme: ExtensionContext["ui"]["theme"],
  onPick: (item: AutocompleteItem) => void,
  onClose: () => void,
  requestRender: () => void,
  showOverlay: ShowOverlay,
): { modal: AtModal; handle: TriggerModalHandle } {
  const modal = new AtModal(ctx.cwd, uiTheme, onPick, onClose, requestRender);
  const handle = showOverlay(modal, {
    ...createPanelOverlayOptions(80, "85%"),
    nonCapturing: true,
  });
  return { modal, handle };
}
