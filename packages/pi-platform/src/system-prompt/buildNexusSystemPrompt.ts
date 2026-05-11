import { appendPromptTail } from "./appendPromptTail.js";
import { createNexusDefaultPromptBody } from "./createNexusDefaultPromptBody.js";
import type { NexusSystemPromptOptions } from "./types.js";

/**
 * Builds Nexus' system prompt with Pi parity, excluding Pi documentation guidance.
 *
 * @param options System prompt options from AgentSession.
 * @returns Complete Nexus system prompt.
 */
export function buildNexusSystemPrompt(options: NexusSystemPromptOptions): string {
	const appendSection = options.appendSystemPrompt ? `\n\n${options.appendSystemPrompt}` : "";
	if (options.customPrompt) {
		const customPromptHasRead = !options.selectedTools || options.selectedTools.includes("read");
		return appendPromptTail(`${options.customPrompt}${appendSection}`, options, customPromptHasRead);
	}
	const hasRead = (options.selectedTools ?? ["read", "bash", "edit", "write"]).includes("read");
	return appendPromptTail(`${createNexusDefaultPromptBody(options)}${appendSection}`, options, hasRead);
}
