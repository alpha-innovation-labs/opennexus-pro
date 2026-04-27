import { buildLineLcsTable } from "./buildLineLcsTable.js";
import type { LineDiffOperation } from "./LineDiffOperation.js";

/**
 * Creates line-aware diff operations so inserted lines do not corrupt unrelated line content.
 */
export function createLineDiffOperations(previous: string, next: string): LineDiffOperation[] {
	const oldLines = previous.split(/\r?\n/);
	const newLines = next.split(/\r?\n/);
	const table = buildLineLcsTable(oldLines, newLines);
	const operations: LineDiffOperation[] = [];
	let oldIndex = 0;
	let newIndex = 0;
	while (oldIndex < oldLines.length || newIndex < newLines.length) {
		if (oldLines[oldIndex] === newLines[newIndex]) {
			operations.push({ kind: "unchanged", oldLine: oldLines[oldIndex], newLine: newLines[newIndex], currentLineNumber: newIndex + 1 });
			oldIndex += 1;
			newIndex += 1;
		} else if (newIndex < newLines.length && (oldIndex === oldLines.length || table[oldIndex][newIndex + 1] >= table[oldIndex + 1]?.[newIndex])) {
			operations.push({ kind: "added", newLine: newLines[newIndex], currentLineNumber: newIndex + 1 });
			newIndex += 1;
		} else if (oldIndex < oldLines.length) {
			operations.push({ kind: "removed", oldLine: oldLines[oldIndex] });
			oldIndex += 1;
		}
	}
	return operations;
}
