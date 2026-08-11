import { findAgentsSectionRange } from "./findAgentsSectionRange";

/**
 * Replaces only the AGENTS.md section inside a full system prompt.
 *
 * @param prompt Full effective system prompt.
 * @param agentsSection Updated AGENTS.md section text.
 * @returns Full prompt with AGENTS.md replaced.
 */
export function replaceAgentsSection(
	prompt: string,
	agentsSection: string,
): string {
	const range = findAgentsSectionRange(prompt);
	if (!range) return agentsSection;
	const prefix = prompt.slice(0, range.start);
	const suffix = prompt.slice(range.end).replace(/^\n+/, "\n");
	return `${prefix}${agentsSection.trim()}${suffix}`;
}
