import { formatSkillsForPrompt } from "@earendil-works/pi-coding-agent";
import { appendAgentsSection } from "./appendAgentsSection";
import { formatCurrentDate } from "./formatCurrentDate";
import type { NexusSystemPromptOptions } from "./types";

/**
 * Appends context, skills, date, and working directory like Pi's prompt builder.
 *
 * @param prompt Prompt body before trailing dynamic sections.
 * @param options System prompt options from AgentSession.
 * @param includeSkills Whether skills are allowed for the prompt mode.
 * @returns Complete prompt text.
 */
export function appendPromptTail(prompt: string, options: NexusSystemPromptOptions, includeSkills: boolean): string {
	let next = appendAgentsSection(prompt, options.contextFiles ?? []);
	if (includeSkills && (options.skills?.length ?? 0) > 0) {
		next += formatSkillsForPrompt((options.skills ?? []) as Parameters<typeof formatSkillsForPrompt>[0]);
	}
	next += `\nCurrent date: ${formatCurrentDate()}`;
	next += `\nCurrent working directory: ${options.cwd.replace(/\\/g, "/")}`;
	return next;
}
