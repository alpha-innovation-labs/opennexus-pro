import type { SharedModalHotkey } from "./types.js";
import { splitModalHotkeyKeys } from "./splitModalHotkeyKeys.js";

/**
 * Removes base hotkey hints already covered by modal-specific hotkeys.
 *
 * @param baseHotkeys Base hotkeys that may be shown.
 * @param overrideHotkeys Modal-specific hotkeys shown first.
 * @returns Base hotkeys not covered by overrides.
 */
export function filterDuplicateBaseHotkeys(baseHotkeys: readonly SharedModalHotkey[], overrideHotkeys: readonly SharedModalHotkey[]): SharedModalHotkey[] {
  const overrideKeys = new Set(overrideHotkeys.flatMap((hotkey) => splitModalHotkeyKeys(hotkey.key)));
  return baseHotkeys.filter((baseHotkey) => splitModalHotkeyKeys(baseHotkey.key).some((key) => !overrideKeys.has(key)));
}
