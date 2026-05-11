/**
 * Detects whether an AGENTS.md context file is present in the effective system prompt.
 *
 * @param systemPrompt Effective system prompt text.
 * @returns True when AGENTS.md was loaded into project context.
 */
export function isAgentsMdLoadedInSystemPrompt(systemPrompt: string): boolean {
	return /^## .*AGENTS\.md\s*$/gmu.test(systemPrompt);
}
