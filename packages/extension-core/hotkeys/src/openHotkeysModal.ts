import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import type { HotkeysModal } from "./HotkeysModal";
import type { HotkeysExtensionShortcut, HotkeysKeybindings } from "./types";
import { HotkeysModal as HotkeysModalComponent } from "./HotkeysModal";

export type HotkeysOverlayHandle = { hide(): void; focus(): void };
export type ShowHotkeysOverlay = (component: HotkeysModal, options?: unknown) => HotkeysOverlayHandle;

/**
 * Opens the hotkeys modal and wires its close callback to the overlay.
 *
 * @param uiTheme Active UI theme.
 * @param keybindings Injected Pi keybinding manager.
 * @param extensionShortcuts Extension shortcuts to display.
 * @param showOverlay Overlay factory.
 * @param onClose Callback invoked after the overlay closes.
 * @returns Modal and overlay handle.
 */
export function openHotkeysModal(
  uiTheme: ExtensionContext["ui"]["theme"],
  keybindings: HotkeysKeybindings,
  extensionShortcuts: HotkeysExtensionShortcut[],
  showOverlay: ShowHotkeysOverlay,
  onClose: () => void,
): { modal: HotkeysModal; handle: HotkeysOverlayHandle } {
  let handle: HotkeysOverlayHandle | undefined;
  const modal = new HotkeysModalComponent(uiTheme, keybindings, extensionShortcuts, () => {
    handle?.hide();
    onClose();
  });
  handle = showOverlay(modal, createPanelOverlayOptions(92, "100%"));
  handle.focus();
  return { modal, handle };
}
