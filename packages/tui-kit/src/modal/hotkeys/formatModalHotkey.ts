import type { SharedModalTheme } from "../types";
import { getModalHotkeyColor } from "./getModalHotkeyColor";
import type { SharedModalHotkey } from "./types";

/**
 * Formats one hotkey hint with purple key text and dim label text.
 *
 * @param theme Modal theme used to color the hotkey.
 * @param hotkey Hotkey hint to format.
 * @returns Rendered hotkey segment.
 */
export function formatModalHotkey(theme: SharedModalTheme, hotkey: SharedModalHotkey): string {
  return `${theme.fg(getModalHotkeyColor(), hotkey.key)} ${theme.fg("dim", hotkey.label)}`;
}
