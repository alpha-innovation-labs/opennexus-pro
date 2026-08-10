import type { ContextUsageDetailItem } from "./types";
import { estimateTokensFromText } from "./estimateTokensFromText";
import { getToolText } from "./getToolText";
import { isMcpToolName } from "./isMcpToolName";

/**
 * Parses tool entries from the rendered system prompt when structured options are unavailable.
 *
 * @param systemPrompt Rendered system prompt.
 * @param mcpOnly Whether to include only MCP tools.
 * @returns Tool detail items from the Available tools section.
 */
export function createPromptToolItems(systemPrompt: string, mcpOnly: boolean): ContextUsageDetailItem[] {
  const section = systemPrompt.match(/Available tools:\n(?<body>[\s\S]*?)\n\nIn addition/u)?.groups?.body ?? "";
  return section
    .split("\n")
    .map((line) => line.match(/^-\s+([^:]+):\s*(.*)$/u))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .filter((match) => isMcpToolName(match[1] ?? "") === mcpOnly)
    .map((match) => ({ label: match[1] ?? "unknown", tokens: estimateTokensFromText(getToolText(match[1] ?? "", match[2] ?? "")) }));
}
