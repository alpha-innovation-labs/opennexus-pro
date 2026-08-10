import { findAppendSectionRange } from "./findAppendSectionRange";

/**
 * Replaces only the appendSection inside a full system prompt.
 *
 * @param prompt Full effective system prompt.
 * @param appendSection Updated appendSection text.
 * @returns Full prompt with appendSection replaced.
 */
export function replaceAppendSection(prompt: string, appendSection: string): string {
	const range = findAppendSectionRange(prompt);
	if (!range) return appendSection;
	const prefix = prompt.slice(0, range.start);
	const suffix = prompt.slice(range.end);
	return `${prefix}${appendSection.trim()}${suffix}`;
}
