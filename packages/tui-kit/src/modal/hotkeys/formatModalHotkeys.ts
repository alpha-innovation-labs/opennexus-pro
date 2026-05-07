import type { SharedModalTheme } from "../types.js";
import { formatModalHotkey } from "./formatModalHotkey.js";
import type { SharedModalHotkey } from "./types.js";

/**
 * Formats hotkey hints with purple key text.
 *
 * @param theme Modal theme used to color keys.
 * @param hotkeys Hotkey hints to format.
 * @returns Single display string for the hotkey group.
 */
export function formatModalHotkeys(theme: SharedModalTheme, hotkeys: readonly SharedModalHotkey[]): string {
  return hotkeys.map((hotkey) => formatModalHotkey(theme, hotkey)).join(theme.fg("dim", " · "));
}
