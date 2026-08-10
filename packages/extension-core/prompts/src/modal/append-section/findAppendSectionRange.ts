export interface AppendSectionRange {
	start: number;
	end: number;
}

/**
 * Finds the editable appendSection range in the rendered system prompt.
 *
 * @param prompt Effective system prompt text.
 * @returns Character range for appendSection, or undefined when absent.
 */
export function findAppendSectionRange(prompt: string): AppendSectionRange | undefined {
	const start = prompt.indexOf("You are Nexus");
	if (start < 0) return undefined;
	const agents = prompt.indexOf("\n# AGENTS.md", start);
	const projectContext = prompt.indexOf("\n# Project Context", start);
	const currentDate = prompt.indexOf("\nCurrent date:", start);
	const candidates = [agents, projectContext, currentDate].filter((index) => index >= 0);
	const end = candidates.length > 0 ? Math.min(...candidates) : prompt.length;
	return { start, end };
}
