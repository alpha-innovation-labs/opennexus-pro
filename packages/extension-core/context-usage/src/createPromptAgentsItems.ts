import { estimateTokensFromText } from "./estimateTokensFromText";
import { readAgentsFileContent } from "./readAgentsFileContent";
import type { ContextUsageDetailItem } from "./types";

/**
 * Parses AGENTS.md context files from the rendered system prompt.
 *
 * @param systemPrompt Rendered system prompt.
 * @returns AGENTS.md detail items.
 */
export function createPromptAgentsItems(
	systemPrompt: string,
): ContextUsageDetailItem[] {
	const matches = systemPrompt.matchAll(
		/(?:^|\n)##\s+(.+AGENTS\.md)[^\S\r\n]*\n+([\s\S]*?)(?=\n##\s+|\n+The following skills|\n+Current date:|$)/gu,
	);
	return Array.from(matches).map((match) => {
		const label = match[1] ?? "AGENTS.md";
		const content = readAgentsFileContent(label) ?? match[2] ?? "";
		return { label, tokens: estimateTokensFromText(content) };
	});
}
