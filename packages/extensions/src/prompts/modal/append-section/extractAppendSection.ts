import { findAppendSectionRange } from "./findAppendSectionRange.js";

/**
 * Extracts the editable appendSection from a full system prompt.
 *
 * @param prompt Effective system prompt text.
 * @returns appendSection text when present, otherwise the full prompt fallback.
 */
export function extractAppendSection(prompt: string): string {
	const range = findAppendSectionRange(prompt);
	if (!range) return prompt;
	return prompt.slice(range.start, range.end).trim();
}
