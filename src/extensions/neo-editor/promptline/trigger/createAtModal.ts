import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { AtModal } from "../AtModal.js";
import type { TriggerModalHandle } from "./types.js";

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
  showOverlay: ExtensionContext["ui"]["showOverlay"],
): { modal: AtModal; handle: TriggerModalHandle } {
  const modal = new AtModal(ctx.cwd, uiTheme, onPick, onClose, requestRender);
  const handle = showOverlay(modal, {
    anchor: "center",
    width: "80%",
    minWidth: 80,
    maxHeight: "85%",
    nonCapturing: true,
  });
  return { modal, handle };
}
