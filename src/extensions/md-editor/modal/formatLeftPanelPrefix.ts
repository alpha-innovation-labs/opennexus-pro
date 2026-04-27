import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

/**
 * Formats the left-pane gutter prefix for a source row or wrapped continuation row.
 */
export function formatLeftPanelPrefix(lineNumber: number | undefined, selectedLineNumber: number, gutterWidth: number, hasChat: boolean, theme: ExtensionCommandContext["ui"]["theme"]): string {
	const selected = lineNumber === selectedLineNumber;
	const selector = selected ? "▶" : " ";
	const numberText = lineNumber === undefined ? " ".repeat(gutterWidth) : String(lineNumber).padStart(gutterWidth, " ");
	const marker = lineNumber !== undefined && hasChat ? "●" : " ";
	return theme.fg(selected ? "accent" : "muted", `${selector} ${numberText} ${marker} │ `);
}
