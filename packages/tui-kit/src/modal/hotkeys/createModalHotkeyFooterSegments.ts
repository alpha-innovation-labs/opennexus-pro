import type { SharedModalTheme } from "../types.js";
import { filterDuplicateBaseHotkeys } from "./filterDuplicateBaseHotkeys.js";
import { formatModalHotkey } from "./formatModalHotkey.js";
import { getBaseScrollHotkeys } from "./getBaseScrollHotkeys.js";
import type { SharedModalHotkey } from "./types.js";

/**
 * Creates ordered footer hotkey segments with overrides before base scroll hints.
 *
 * @param theme Modal theme used to color hotkey segments.
 * @param overrideHotkeys Modal-specific hotkeys shown before base hotkeys.
 * @param showBaseHotkeys Whether base body-scroll hotkeys should be shown.
 * @returns Rendered hotkey footer segments.
 */
export function createModalHotkeyFooterSegments(theme: SharedModalTheme, overrideHotkeys: readonly SharedModalHotkey[], showBaseHotkeys: boolean): string[] {
  const baseHotkeys = showBaseHotkeys ? filterDuplicateBaseHotkeys(getBaseScrollHotkeys(), overrideHotkeys) : [];
  const hotkeys = [...overrideHotkeys, ...baseHotkeys];
  return hotkeys.map((hotkey) => formatModalHotkey(theme, hotkey));
}
