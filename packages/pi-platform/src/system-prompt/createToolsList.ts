import type { NexusSystemPromptOptions } from "./types";

/**
 * Creates Pi-compatible visible tool lines from selected tools and snippets.
 *
 * @param options System prompt options from AgentSession.
 * @returns Markdown list of available tools.
 */
export function createToolsList(options: NexusSystemPromptOptions): string {
	const tools = options.selectedTools ?? ["read", "bash", "edit", "write"];
	const snippets = options.toolSnippets ?? {};
	const visibleTools = tools.filter((name) => snippets[name]);
	if (visibleTools.length === 0) return "(none)";
	return visibleTools.map((name) => `- ${name}: ${snippets[name]}`).join("\n");
}
