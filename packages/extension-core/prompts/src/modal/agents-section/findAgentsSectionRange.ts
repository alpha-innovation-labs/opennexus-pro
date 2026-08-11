export interface AgentsSectionRange {
	start: number;
	end: number;
}

/**
 * Finds the editable AGENTS.md section range in the rendered system prompt.
 *
 * @param prompt Effective system prompt text.
 * @returns Character range for AGENTS.md, or undefined when absent.
 */
export function findAgentsSectionRange(
	prompt: string,
): AgentsSectionRange | undefined {
	const start = prompt.indexOf("# AGENTS.md");
	if (start < 0) return undefined;
	const skills = prompt.indexOf("\n<available_skills>", start);
	const currentDate = prompt.indexOf("\nCurrent date:", start);
	const candidates = [skills, currentDate].filter((index) => index >= 0);
	const end = candidates.length > 0 ? Math.min(...candidates) : prompt.length;
	return { start, end };
}
