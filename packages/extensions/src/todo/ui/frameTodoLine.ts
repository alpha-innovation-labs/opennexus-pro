import { visibleWidth } from "@mariozechner/pi-tui";
import type { TodoTheme } from "../model/types.js";

/**
 * Wraps one line inside the todo modal frame.
 *
 * @param theme Active Pi theme.
 * @param content Inner line content.
 * @param innerWidth Usable content width.
 * @returns Framed line.
 */
export function frameTodoLine(theme: TodoTheme, content: string, innerWidth: number): string {
	const pad = Math.max(0, innerWidth - visibleWidth(content));
	return `${theme.fg("borderMuted", "│")}${content}${" ".repeat(pad)}${theme.fg("borderMuted", "│")}`;
}
