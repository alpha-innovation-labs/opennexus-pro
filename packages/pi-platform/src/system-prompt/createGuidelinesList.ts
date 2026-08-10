import type { NexusSystemPromptOptions } from "./types";

/**
 * Creates Pi-compatible guideline lines, including tool-specific exploration advice.
 *
 * @param options System prompt options from AgentSession.
 * @returns Markdown list of guidelines.
 */
export function createGuidelinesList(options: NexusSystemPromptOptions): string {
	const tools = options.selectedTools ?? ["read", "bash", "edit", "write"];
	const guidelines: string[] = [];
	const seen = new Set<string>();
	const add = (value: string): void => {
		const trimmed = value.trim();
		if (trimmed.length === 0 || seen.has(trimmed)) return;
		seen.add(trimmed);
		guidelines.push(trimmed);
	};

	const hasBash = tools.includes("bash");
	const hasExplorer = tools.includes("grep") || tools.includes("find") || tools.includes("ls");
	if (hasBash && !hasExplorer) add("Use bash for file operations like ls, rg, find");
	if (hasBash && hasExplorer) add("Prefer grep/find/ls tools over bash for file exploration (faster, respects .gitignore)");
	for (const guideline of options.promptGuidelines ?? []) add(guideline);
	add("Be concise in your responses");
	add("Show file paths clearly when working with files");
	return guidelines.map((guideline) => `- ${guideline}`).join("\n");
}
