import type { NexusSystemPromptContextFile } from "./types";

/**
 * Appends Nexus' AGENTS.md section using Pi's project-context content format.
 *
 * @param prompt Existing prompt text.
 * @param contextFiles Project instruction files loaded by Pi.
 * @returns Prompt with AGENTS.md content appended.
 */
export function appendAgentsSection(prompt: string, contextFiles: readonly NexusSystemPromptContextFile[]): string {
	if (contextFiles.length === 0) return prompt;
	let next = `${prompt}\n\n# AGENTS.md\n\nProject-specific instructions and guidelines:\n\n`;
	for (const { path, content } of contextFiles) {
		next += `## ${path}\n\n${content}\n\n`;
	}
	return next;
}
