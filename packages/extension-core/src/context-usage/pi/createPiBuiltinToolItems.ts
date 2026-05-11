import { createPiToolDefinitions, type PiToolDefinition } from "@nexus/pi-platform/tools/createPiToolDefinitions.js";
import type { ContextUsageDetailItem } from "../types.js";
import { estimateTokensFromText } from "../estimateTokensFromText.js";
import { getToolText } from "../getToolText.js";

/**
 * Creates tokenized items for Pi's built-in tool prompt snippets.
 *
 * @param cwd Current working directory passed to Pi tool definitions.
 * @returns Pi built-in tool detail items.
 */
export async function createPiBuiltinToolItems(cwd: string): Promise<ContextUsageDetailItem[]> {
  return Object.entries(createPiToolDefinitions(cwd))
    .filter((entry): entry is [string, PiToolDefinition] => typeof entry[1].promptSnippet === "string" && entry[1].promptSnippet.length > 0)
    .map(([name, definition]) => ({ label: name, tokens: estimateTokensFromText(getToolText(name, definition.promptSnippet ?? "")) }));
}
