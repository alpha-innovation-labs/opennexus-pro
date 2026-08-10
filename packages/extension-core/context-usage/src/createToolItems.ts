import type { ContextUsageDetailItem } from "./types";
import { estimateTokensFromText } from "./estimateTokensFromText";
import { getToolText } from "./getToolText";
import { isMcpToolName } from "./isMcpToolName";

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
