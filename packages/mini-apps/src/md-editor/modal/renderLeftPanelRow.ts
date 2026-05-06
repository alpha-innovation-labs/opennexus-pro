import { visibleWidth } from "@mariozechner/pi-tui";
import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { formatLeftPanelPrefix } from "./formatLeftPanelPrefix.js";
import { wrapLeftPanelBody } from "./wrapLeftPanelBody.js";

/**
 * Renders one source or diff row, wrapping content while numbering only the first visual row.
 */
export function renderLeftPanelRow(body: string, lineNumber: number | undefined, selectedLineNumber: number, chatLines: Set<number>, gutterWidth: number, width: number, theme: ExtensionCommandContext["ui"]["theme"]): string[] {
	const prefix = formatLeftPanelPrefix(lineNumber, selectedLineNumber, gutterWidth, lineNumber !== undefined && chatLines.has(lineNumber), theme);
	const continuationPrefix = formatLeftPanelPrefix(undefined, selectedLineNumber, gutterWidth, false, theme);
	const bodyWidth = Math.max(1, width - visibleWidth(prefix));
	return wrapLeftPanelBody(body, bodyWidth).map((line, index) => `${index === 0 ? prefix : continuationPrefix}${line}`);
}
