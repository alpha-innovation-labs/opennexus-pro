import type { BuildSystemPromptOptions } from "@mariozechner/pi-coding-agent";
import type { ContextUsageDetailItem } from "./types.js";
import { createPromptAgentsItems } from "./createPromptAgentsItems.js";
import { estimateTokensFromText } from "./estimateTokensFromText.js";
import { readAgentsFileContent } from "./readAgentsFileContent.js";

/**
 * Creates tokenized AGENTS.md items from live system prompt options or prompt text.
 *
 * @param options Latest system prompt options.
 * @param systemPrompt Rendered system prompt fallback.
 * @returns AGENTS.md detail items.
 */
export function createAgentsItems(options: BuildSystemPromptOptions | undefined, systemPrompt: string): ContextUsageDetailItem[] {
  const structured = (options?.contextFiles ?? [])
    .filter((file) => file.path.endsWith("AGENTS.md"))
    .map((file) => {
      const content = readAgentsFileContent(file.path) ?? file.content;
      return { label: file.path, tokens: estimateTokensFromText(content) };
    });
  return structured.length > 0 ? structured : createPromptAgentsItems(systemPrompt);
}
