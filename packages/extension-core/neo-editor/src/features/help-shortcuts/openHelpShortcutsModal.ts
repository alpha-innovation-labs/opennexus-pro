import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import type { TriggerModalHandle, ShowOverlay } from "../promptline/trigger/types";
import { HelpShortcutsModal } from "./HelpShortcutsModal";

/**
 * Opens the keyboard shortcuts modal and wires its close callback to the overlay.
 *
 * @param uiTheme Active UI theme.
 * @param showOverlay Overlay factory.
 * @param onClose Callback invoked after the overlay closes.
 * @returns Modal and overlay handle.
 */
export function openHelpShortcutsModal(
  uiTheme: ExtensionContext["ui"]["theme"],
  showOverlay: ShowOverlay,
  onClose: () => void,
): { modal: HelpShortcutsModal; handle: TriggerModalHandle } {
  let handle: TriggerModalHandle | undefined;
  const modal = new HelpShortcutsModal(uiTheme, () => {
    handle?.hide();
    onClose();
  });
  handle = showOverlay(modal, createPanelOverlayOptions(80));
  handle.focus();
  return { modal, handle };
}
