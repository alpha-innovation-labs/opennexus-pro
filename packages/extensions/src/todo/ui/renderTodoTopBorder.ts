import { visibleWidth } from "@mariozechner/pi-tui";
import type { TodoTheme } from "../model/types.js";

/**
 * Builds the titled top border for the todo modal.
 *
 * @param theme Active Pi theme.
 * @param innerWidth Usable content width.
 * @param title Border title text.
 * @param rightText Optional right-side label.
 * @returns Titled top border.
 */
export function renderTodoTopBorder(theme: TodoTheme, innerWidth: number, title: string, rightText = ""): string {
	const label = theme.fg("error", theme.bold(title));
	const right = rightText ? theme.fg("error", rightText) : "";
	const rule = Math.max(0, innerWidth - visibleWidth(title) - visibleWidth(right));
	return `${theme.fg("borderMuted", "┌")}${theme.fg("borderMuted", "─".repeat(Math.floor(rule / 2)))}${label}${theme.fg("borderMuted", "─".repeat(Math.ceil(rule / 2)))}${right}${theme.fg("borderMuted", "┐")}`;
}
