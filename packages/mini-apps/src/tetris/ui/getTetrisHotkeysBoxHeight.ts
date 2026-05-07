import { getTetrisHotkeyRows } from "./getTetrisHotkeyRows.js";

/**
 * Returns the height required to display every hotkey row inside the boxed panel.
 *
 * @returns Hotkeys panel height.
 */
export function getTetrisHotkeysBoxHeight(): number {
	return getTetrisHotkeyRows().length + 2;
}
