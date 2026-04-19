import { truncateToWidth } from "@mariozechner/pi-tui";
import type { TodoTheme } from "../model/types.js";

/**
 * Renders the help view shown in place of the todo list.
 *
 * @param theme Active Pi theme.
 * @param width Available body width.
 * @param height Visible row count.
 * @returns Rendered help rows.
 */
export function renderTodoHelpLines(theme: TodoTheme, width: number, height: number): string[] {
	const rows = [
		theme.fg("error", theme.bold("Hotkeys")),
		"",
		"j / k    move selection",
		"gg / G   first / last item",
		"a        add new todo",
		"e        edit selected todo",
		"x        toggle done",
		"dd       delete selected todo",
		"?        show or hide help",
		"Esc      return to previous mode",
		"Ctrl+C   hide modal",
	].slice(0, height);
	while (rows.length < height) rows.push("");
	return rows.map((row) => truncateToWidth(row, width, ""));
}
