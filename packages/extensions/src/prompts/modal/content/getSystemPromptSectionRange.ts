import type { SystemPromptOutlineRow } from "../outline/createSystemPromptOutlineRows.js";

export interface SystemPromptSectionRange {
	start: number;
	end: number;
}

/**
 * Resolves the prompt line range represented by the selected outline row.
 *
 * @param rows All outline rows.
 * @param selectedIndex Selected row index.
 * @param promptLines Raw prompt lines.
 * @returns Selected content range.
 */
export function getSystemPromptSectionRange(rows: readonly SystemPromptOutlineRow[], selectedIndex: number, promptLines: readonly string[]): SystemPromptSectionRange {
	const row = rows[selectedIndex] ?? rows[0];
	if (!row) return { start: 0, end: promptLines.length };
	const next = rows.slice(selectedIndex + 1).find((candidate) => candidate.lineIndex > row.lineIndex && candidate.level <= row.level);
	return { start: row.lineIndex, end: next?.lineIndex ?? promptLines.length };
}
