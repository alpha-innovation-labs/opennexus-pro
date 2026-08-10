import type { ContextUsageDetailItem } from "./types.js";
import { estimateTokensFromText } from "./estimateTokensFromText.js";
import { getToolText } from "./getToolText.js";
import { isMcpToolName } from "./isMcpToolName.js";

/**
 * Creates tokenized tool detail items from system prompt options.
 *
 * @param snippets Tool snippets keyed by tool name.
 * @param mcpOnly Whether to include only MCP tools.
 * @returns Tool detail items in prompt order.
 */
export function createToolItems(snippets: Record<string, string> | undefined, mcpOnly: boolean): ContextUsageDetailItem[] {
  return Object.entries(snippets ?? {})
    .filter(([name]) => isMcpToolName(name) === mcpOnly)
    .map(([name, snippet]) => ({ label: name, tokens: estimateTokensFromText(getToolText(name, snippet)) }));
}
