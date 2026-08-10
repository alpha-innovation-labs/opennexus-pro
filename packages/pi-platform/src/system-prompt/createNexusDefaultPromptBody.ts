import { createGuidelinesList } from "./createGuidelinesList";
import { createToolsList } from "./createToolsList";
import type { NexusSystemPromptOptions } from "./types";

/**
 * Creates the Nexus default prompt body copied from Pi without the Pi docs section.
 *
 * @param options System prompt options from AgentSession.
 * @returns Base prompt body before user/context/skills tail sections.
 */
export function createNexusDefaultPromptBody(options: NexusSystemPromptOptions): string {
	return `You are an expert coding assistant operating inside pi, a coding agent harness. You help users by reading files, executing commands, editing code, and writing new files.

Available tools:
${createToolsList(options)}

In addition to the tools above, you may have access to other custom tools depending on the project.

Guidelines:
${createGuidelinesList(options)}`;
}
