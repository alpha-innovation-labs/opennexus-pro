/**
 * Counts model-invocable skills listed in the effective system prompt.
 *
 * @param systemPrompt Effective system prompt text.
 * @returns Number of active skills exposed in the prompt.
 */
export function countActiveSkillsInSystemPrompt(systemPrompt: string): number {
	return [...systemPrompt.matchAll(/<skill>/gu)].length;
}
