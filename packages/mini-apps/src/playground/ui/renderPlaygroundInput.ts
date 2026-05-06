import type { ExtensionEditorComponent } from "@mariozechner/pi-coding-agent";
import { visibleWidth } from "@mariozechner/pi-tui";
import { extractEditorContentLines } from "@nexus/extensions/neo-editor/shared/ui/extractEditorContentLines.js";
import { padToWidth } from "@nexus/extensions/neo-editor/shared/ui/padToWidth.js";
import { prefixEditorLine } from "@nexus/extensions/neo-editor/shared/ui/prefixEditorLine.js";
import { renderPromptlineBorder } from "@nexus/extensions/neo-editor/shared/ui/renderPromptlineBorder.js";

/**
 * Renders the playground input using Neo editor chrome.
 *
 * @param input Playground input editor.
 * @param theme Active Pi theme.
 * @param width Available width.
 * @param status Current playground status.
 * @returns Neo-styled input lines.
 */
export function renderPlaygroundInput(
	input: ExtensionEditorComponent,
	theme: any,
	width: number,
	status: string,
): string[] {
	const borderColor = (text: string) => theme.fg("error", text);
	const innerWidth = Math.max(1, width - 2);
	const baseLines = input.render(innerWidth);
	const editorContent = extractEditorContentLines(baseLines);
	const contentLines = (editorContent.length > 0 ? editorContent : [""]).map((line) => padToWidth(line, innerWidth));
	contentLines[0] = prefixEditorLine(contentLines[0]!.replace(/^\s+/, ""), innerWidth, "» ", (text) => theme.fg("error", text));
	const top = borderColor("╭") + renderPromptlineBorder(borderColor, theme, innerWidth, {
		left: theme.fg("accent", theme.bold("playground")),
		right: ` ${theme.fg("warning", status)} `,
	}) + borderColor("╮");
	const middle = contentLines.map((line) => borderColor("│") + line + borderColor("│"));
	const bottom = borderColor("╰" + "─".repeat(innerWidth) + "╯");
	return [top, ...middle, bottom].map((line) => {
		const pad = Math.max(0, width - visibleWidth(line));
		return line + " ".repeat(pad);
	});
}
