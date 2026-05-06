import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "../../../overlay/createPanelOverlayOptions.js";
import type { TriggerModalHandle, ShowOverlay } from "../promptline/trigger/types.js";
import type { WhichKeyExtensionShortcut, WhichKeyKeybindings } from "./types.js";
import { WhichKeyModal } from "./WhichKeyModal.js";

/**
 * Opens the which-key modal and wires its close callback to the overlay.
 *
 * @param uiTheme Active UI theme.
 * @param keybindings Injected Pi keybinding manager.
 * @param extensionShortcuts Extension shortcuts to display.
 * @param showOverlay Overlay factory.
 * @param onClose Callback invoked after the overlay closes.
 * @returns Modal and overlay handle.
 */
export function openWhichKeyModal(
  uiTheme: ExtensionContext["ui"]["theme"],
  keybindings: WhichKeyKeybindings,
  extensionShortcuts: WhichKeyExtensionShortcut[],
  showOverlay: ShowOverlay,
  onClose: () => void,
): { modal: WhichKeyModal; handle: TriggerModalHandle } {
  let handle: TriggerModalHandle | undefined;
  const modal = new WhichKeyModal(uiTheme, keybindings, extensionShortcuts, () => {
    handle?.hide();
    onClose();
  });
  handle = showOverlay(modal, createPanelOverlayOptions(92, "100%"));
  handle.focus();
  return { modal, handle };
}
