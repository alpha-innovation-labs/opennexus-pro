import type { ExtensionEditorComponent } from "@mariozechner/pi-coding-agent";
import { visibleWidth } from "@mariozechner/pi-tui";
import { extractEditorContentLines } from "@nexus/extensions/neo-editor/shared/ui/extractEditorContentLines.js";
import { padToWidth } from "@nexus/extensions/neo-editor/shared/ui/padToWidth.js";
import { prefixEditorLine } from "@nexus/extensions/neo-editor/shared/ui/prefixEditorLine.js";
import type { TodoTheme } from "../model/types.js";
import { getTodoInputEditor } from "./getTodoInputEditor.js";
import { renderTodoModeBadge } from "./renderTodoModeBadge.js";

/**
 * Renders the bottom todo editor with Neo-style chrome.
 *
 * @param input Todo editor component.
 * @param theme Active Pi theme.
 * @param width Available width.
 * @param status Current input status label.
 * @returns Rendered input lines.
 */
export function renderTodoInput(
	input: ExtensionEditorComponent,
	theme: TodoTheme,
	width: number,
	status: string,
): string[] {
	const borderColor = (text: string) => theme.fg("error", text);
	const boxWidth = Math.max(8, width - 2);
	const leftGutter = Math.max(0, Math.floor((width - boxWidth) / 2));
	const rightGutter = Math.max(0, width - boxWidth - leftGutter);
	const innerWidth = Math.max(1, boxWidth - 2);
	const editor = getTodoInputEditor(input);
	const baseLines = editor ? editor.render(innerWidth) : [""];
	const editorContent = extractEditorContentLines(baseLines);
	const contentLines = (editorContent.length > 0 ? editorContent : [""]).map((line) => padToWidth(line, innerWidth));
	contentLines[0] = prefixEditorLine(contentLines[0]!.replace(/^\s+/, ""), innerWidth, "» ", borderColor);
	const badge = renderTodoModeBadge(status);
	const rightLabel = `${borderColor(" ? ")}`;
	const leftSegment = `${borderColor("─ ")}${badge} `;
	const fillerWidth = Math.max(0, innerWidth - visibleWidth(leftSegment) - visibleWidth(rightLabel));
	const top = borderColor("╭") + leftSegment + borderColor("─".repeat(fillerWidth)) + rightLabel + borderColor("╮");
	const middle = contentLines.map((line) => borderColor("│") + line + borderColor("│"));
	const bottom = borderColor("╰" + "─".repeat(innerWidth) + "╯");
	return [top, ...middle, bottom].map((line) => `${" ".repeat(leftGutter)}${line}${" ".repeat(rightGutter)}`);
}
