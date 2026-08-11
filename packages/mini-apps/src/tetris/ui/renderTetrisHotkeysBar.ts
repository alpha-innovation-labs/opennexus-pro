import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";
import { getTetrisHotkeyRows } from "./getTetrisHotkeyRows";
import { renderTetrisBox } from "./renderTetrisBox";
import { wrapTetrisText } from "./wrapTetrisText";

/**
 * Renders compact hotkeys as a wrapping horizontal bar.
 *
 * @param theme Active UI theme.
 * @param width Panel width.
 * @param height Panel height.
 * @returns Boxed hotkey bar lines.
 */
export function renderTetrisHotkeysBar(theme: SharedModalTheme & { bold: (text: string) => string }, width: number, height: number): string[] {
	const parts = getTetrisHotkeyRows().map(([key, label]) => `${theme.fg("accent", key)} ${label}`);
	return renderTetrisBox(theme, "Hotkeys", wrapTetrisText(parts, Math.max(1, width - 2), theme.fg("borderAccent", " | ")), width, height);
}
