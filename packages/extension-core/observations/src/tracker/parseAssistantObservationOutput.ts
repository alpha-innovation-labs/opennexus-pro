/**
 * Parses and validates assistant-observation JSON returned by the LLM.
 *
 * @param output Raw LLM output.
 * @returns Clean observation bullets.
 */
export function parseAssistantObservationOutput(output: string): string[] {
	const trimmed = output.trim();
	if (!trimmed) return [];
	try {
		const parsed = JSON.parse(trimmed) as unknown;
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
	} catch {
		return [];
	}
}
