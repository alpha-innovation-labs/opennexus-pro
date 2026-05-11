import { findAgentsSectionRange } from "./findAgentsSectionRange.js";

/**
 * Extracts the editable AGENTS.md section from a full system prompt.
 *
 * @param prompt Full effective system prompt.
 * @returns AGENTS.md section text when present, otherwise an empty string.
 */
export function extractAgentsSection(prompt: string): string {
	const range = findAgentsSectionRange(prompt);
	if (!range) return "";
	return prompt.slice(range.start, range.end).trim();
}
