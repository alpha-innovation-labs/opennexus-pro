import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import type { TodoItem, TodoTheme } from "../model/types.js";
import { formatTodoAge } from "./formatTodoAge.js";

/**
 * Renders the visible todo rows for the modal body.
 *
 * @param theme Active Pi theme.
 * @param items Current todo items.
 * @param width Available body width.
 * @param height Visible row count.
 * @param selectedIndex Selected row index.
 * @param scrollOffset First rendered item index.
 * @param editingId Item currently being edited.
 * @returns Rendered todo rows.
 */
export function renderTodoListLines(
	theme: TodoTheme,
	items: TodoItem[],
	width: number,
	height: number,
	selectedIndex: number,
	scrollOffset: number,
	editingId: string | null,
): string[] {
	if (items.length === 0) {
		return [theme.fg("muted", "No todos yet")].concat(Array.from({ length: Math.max(0, height - 1) }, () => ""));
	}
	const visibleItems = [] as Array<{ done: boolean; line: string }>;
	for (let index = scrollOffset; index < Math.min(items.length, scrollOffset + height); index++) {
		const item = items[index]!;
		const selected = index === selectedIndex;
		const marker = selected ? theme.fg("error", "› ") : "  ";
		const checkbox = item.done ? theme.fg("accent", "☑ ") : theme.fg("muted", "☐ ");
		const editTag = item.id === editingId ? theme.fg("warning", " [edit]") : "";
		const age = theme.fg("dim", formatTodoAge(item.updatedAt));
		const prefix = `${marker}${checkbox}`;
		const suffix = ` ${age}${editTag}  `;
		const text = truncateToWidth(item.text, Math.max(1, width - visibleWidth(prefix) - visibleWidth(suffix)), "");
		const baseText = item.done ? theme.strikethrough(text) : text;
		const body = selected ? theme.fg("error", theme.bold(baseText)) : item.done ? theme.fg("muted", baseText) : text;
		const gap = " ".repeat(Math.max(1, width - visibleWidth(prefix) - visibleWidth(text) - visibleWidth(suffix)));
		visibleItems.push({ done: item.done, line: truncateToWidth(`${prefix}${body}${gap}${suffix}`, width, "") });
	}
	const doneLines = visibleItems.filter((item) => item.done).map((item) => item.line);
	const openLines = visibleItems.filter((item) => !item.done).map((item) => item.line);
	const spacerLines = Array.from({ length: Math.max(0, height - doneLines.length - openLines.length) }, () => "");
	return [...doneLines, ...spacerLines, ...openLines];
}
