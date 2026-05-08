import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { ContextUsageDetailItem } from "../types.js";
import { estimateTokensFromText } from "../estimateTokensFromText.js";
import { getToolText } from "../getToolText.js";
import { getPiCodingAgentDistRoot } from "./getPiCodingAgentDistRoot.js";

interface PiToolDefinition {
  name: string;
  promptSnippet?: string;
}

interface PiToolsModule {
  createAllToolDefinitions(cwd: string): Record<string, PiToolDefinition>;
}

/**
 * Creates tokenized items for Pi's built-in tool prompt snippets.
 *
 * @param cwd Current working directory passed to Pi tool definitions.
 * @returns Pi built-in tool detail items.
 */
export async function createPiBuiltinToolItems(cwd: string): Promise<ContextUsageDetailItem[]> {
  const modulePath = join(getPiCodingAgentDistRoot(), "core", "tools", "index.js");
  const module = await import(pathToFileURL(modulePath).href) as PiToolsModule;
  return Object.entries(module.createAllToolDefinitions(cwd))
    .filter((entry): entry is [string, PiToolDefinition] => typeof entry[1].promptSnippet === "string" && entry[1].promptSnippet.length > 0)
    .map(([name, definition]) => ({ label: name, tokens: estimateTokensFromText(getToolText(name, definition.promptSnippet ?? "")) }));
}
