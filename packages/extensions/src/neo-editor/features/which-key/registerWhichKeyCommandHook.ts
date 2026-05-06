import { setHotkeysCommandHook } from "@nexus/pi-platform/hotkeysCommandHook.js";
import { createPanelOverlayOptions } from "../../../overlay/createPanelOverlayOptions.js";
import { getModeExtensionShortcuts } from "./getModeExtensionShortcuts.js";
import { getModeKeybindings } from "./getModeKeybindings.js";
import { WhichKeyModal } from "./WhichKeyModal.js";

/**
 * Registers the Nexus which-key renderer for Pi's built-in /hotkeys command.
 */
export function registerWhichKeyCommandHook(): void {
  setHotkeysCommandHook((mode) => {
    const ui = (mode as { createExtensionUIContext?: () => { custom: <T>(factory: (...args: never[]) => unknown, options?: unknown) => Promise<T> } }).createExtensionUIContext?.();
    const modeKeybindings = getModeKeybindings(mode);
    if (!ui || !modeKeybindings) return;
    void ui.custom<void>((_tui, theme, keybindings, done) => new WhichKeyModal(theme, keybindings as never, getModeExtensionShortcuts(mode, modeKeybindings), done), {
      overlay: true,
      overlayOptions: createPanelOverlayOptions(92, "100%"),
    });
  });
}
