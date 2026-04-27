import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { MarkdownDiffRow } from "./MarkdownDiffRow.js";
import { createLineDiffOperations } from "./createLineDiffOperations.js";
import { renderInlineMarkdownDiffLine } from "./renderInlineMarkdownDiffLine.js";
import { renderMarkdownDiffRow } from "./renderMarkdownDiffRow.js";

/**
 * Renders line-aware Markdown diff rows with current-file line numbers kept separate from removed rows.
 */
export function renderMarkdownDiffRows(previous: string, next: string, theme: ExtensionCommandContext["ui"]["theme"]): MarkdownDiffRow[] {
	const operations = createLineDiffOperations(previous, next);
	const rows: MarkdownDiffRow[] = [];
	for (let index = 0; index < operations.length; index += 1) {
		const operation = operations[index];
		const nextOperation = operations[index + 1];
		if (operation.kind === "removed" && nextOperation?.kind === "added") {
			rows.push({ kind: "changed", text: renderInlineMarkdownDiffLine(operation.oldLine, nextOperation.newLine, theme), currentLineNumber: nextOperation.currentLineNumber });
			index += 1;
		} else {
			rows.push(renderMarkdownDiffRow(operation, theme));
		}
	}
	return rows;
}
