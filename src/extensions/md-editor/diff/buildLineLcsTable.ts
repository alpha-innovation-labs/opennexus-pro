/**
 * Builds a longest-common-subsequence table for old and new Markdown lines.
 */
export function buildLineLcsTable(oldLines: string[], newLines: string[]): number[][] {
	const table = Array.from({ length: oldLines.length + 1 }, () => Array.from({ length: newLines.length + 1 }, () => 0));
	for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex -= 1) {
		for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex -= 1) {
			table[oldIndex][newIndex] = oldLines[oldIndex] === newLines[newIndex] ? table[oldIndex + 1][newIndex + 1] + 1 : Math.max(table[oldIndex + 1][newIndex], table[oldIndex][newIndex + 1]);
		}
	}
	return table;
}
