import { getTetrisHotkeyRows } from "./getTetrisHotkeyRows.js";
import { renderTetrisBox } from "./renderTetrisBox.js";
import { wrapTetrisText } from "./wrapTetrisText.js";

/**
 * Renders compact hotkeys as a wrapping horizontal bar.
 *
 * @param theme Active UI theme.
 * @param width Panel width.
 * @param height Panel height.
 * @returns Boxed hotkey bar lines.
 */
export function renderTetrisHotkeysBar(theme: any, width: number, height: number): string[] {
	const parts = getTetrisHotkeyRows().map(([key, label]) => `${theme.fg("accent", key)} ${label}`);
	return renderTetrisBox(theme, "Hotkeys", wrapTetrisText(parts, Math.max(1, width - 2)), width, height);
}
