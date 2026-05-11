import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import type { LineDiffOperation } from "./LineDiffOperation.js";
import type { MarkdownDiffRow } from "./MarkdownDiffRow.js";

/**
 * Renders one line diff operation as a display row.
 */
export function renderMarkdownDiffRow(operation: LineDiffOperation, theme: ExtensionCommandContext["ui"]["theme"]): MarkdownDiffRow {
	if (operation.kind === "unchanged") return { kind: "unchanged", text: operation.newLine, currentLineNumber: operation.currentLineNumber };
	if (operation.kind === "added") return { kind: "added", text: theme.fg("success", operation.newLine), currentLineNumber: operation.currentLineNumber };
	return { kind: "removed", text: theme.fg("error", `\x1b[9m${operation.oldLine}\x1b[29m`) };
}
