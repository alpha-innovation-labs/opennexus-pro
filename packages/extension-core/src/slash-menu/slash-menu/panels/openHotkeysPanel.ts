import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { HotkeysModal } from "../../../hotkeys/HotkeysModal.ts";
import { getRegisteredHotkeysShortcuts } from "../../../hotkeys/getRegisteredHotkeysShortcuts.ts";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";

/**
 * Opens the hotkeys panel. Closes the slash menu.
 * Pure side-effect function — no state returned.
 */
export async function openHotkeysPanel(
  ctx: ExtensionContext,
  requestClose: () => void,
  custom: (fn: (arg0: never, arg1: never, arg2: never, arg3: never) => Promise<void>, opts: never) => Promise<void>,
): Promise<void> {
  requestClose();
  await custom(
    (_tui, theme, keybindings, done) =>
      new HotkeysModal(theme, keybindings as never, getRegisteredHotkeysShortcuts(), done),
    { overlay: true, overlayOptions: createPanelOverlayOptions(92, "100%") as never },
  );
}
