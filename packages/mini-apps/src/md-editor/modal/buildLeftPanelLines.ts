import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import type { MarkdownFileSnapshot } from "../file/computeMarkdownFileSnapshot.js";
import type { MarkdownDiffRow } from "../diff/MarkdownDiffRow.js";
import { renderMarkdownDiffRows } from "../diff/renderMarkdownDiffRows.js";
import { renderMarkdownLine } from "./renderMarkdownLine.js";
import { renderLeftPanelRow } from "./renderLeftPanelRow.js";

/**
 * Builds visible left-pane lines with numbers, selection, and chat markers.
 */
export function buildLeftPanelLines(snapshot: MarkdownFileSnapshot, selectedLineNumber: number, chatLines: Set<number>, width: number, theme: ExtensionCommandContext["ui"]["theme"], baselineContent?: string): string[] {
	const gutterWidth = String(snapshot.lines.length).length;
	const rows = baselineContent && baselineContent !== snapshot.content ? renderMarkdownDiffRows(baselineContent, snapshot.content, theme) : snapshot.lines.map((line, index): MarkdownDiffRow => ({ kind: "unchanged", text: renderMarkdownLine(line, theme), currentLineNumber: index + 1 }));
	return rows.flatMap((row) => renderLeftPanelRow(row.text, row.currentLineNumber, selectedLineNumber, chatLines, gutterWidth, width, theme));
}
