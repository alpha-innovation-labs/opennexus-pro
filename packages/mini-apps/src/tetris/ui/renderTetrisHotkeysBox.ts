import { getTetrisHotkeyRows } from "./getTetrisHotkeyRows.js";
import { renderTetrisBox } from "./renderTetrisBox.js";

/**
 * Renders the boxed hotkey table with purple key labels.
 *
 * @param theme Active UI theme.
 * @param width Panel width.
 * @param height Panel height.
 * @returns Boxed hotkey panel lines.
 */
export function renderTetrisHotkeysBox(theme: any, width: number, height: number): string[] {
	const lines = getTetrisHotkeyRows().map(([key, label]) => `${theme.fg("accent", key.padEnd(6))} ${label}`);
	return renderTetrisBox(theme, "Hotkeys", lines, width, height);
}
