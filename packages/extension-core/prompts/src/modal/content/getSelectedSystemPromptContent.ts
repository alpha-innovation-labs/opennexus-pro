import { getSystemPromptSectionRange } from "./getSystemPromptSectionRange";
import type { SystemPromptOutlineRow } from "../outline/createSystemPromptOutlineRows";

/**
 * Extracts the raw prompt text represented by the selected outline row.
 *
 * @param prompt Full effective system prompt.
 * @param rows Outline rows.
 * @param selectedIndex Selected outline row index.
 * @returns Selected prompt section text.
 */
export function getSelectedSystemPromptContent(prompt: string, rows: readonly SystemPromptOutlineRow[], selectedIndex: number): string {
	const promptLines = prompt.split("\n");
	const range = getSystemPromptSectionRange(rows, selectedIndex, promptLines);
	return promptLines.slice(range.start, range.end).join("\n");
}
