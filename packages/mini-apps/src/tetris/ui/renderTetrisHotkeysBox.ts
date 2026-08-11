import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";
import { getTetrisHotkeyRows } from "./getTetrisHotkeyRows";
import { renderTetrisBox } from "./renderTetrisBox";

/**
 * Renders the boxed hotkey table with purple key labels.
 *
 * @param theme Active UI theme.
 * @param width Panel width.
 * @param height Panel height.
 * @returns Boxed hotkey panel lines.
 */
export function renderTetrisHotkeysBox(theme: SharedModalTheme & { bold: (text: string) => string }, width: number, height: number): string[] {
	const lines = getTetrisHotkeyRows().map(([key, label]) => `${theme.fg("accent", key.padEnd(6))} ${label}`);
	return renderTetrisBox(theme, "Hotkeys", lines, width, height);
}
