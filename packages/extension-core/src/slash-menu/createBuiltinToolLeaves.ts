import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { getPiCodingAgentDistRoot } from "../context-usage/pi/getPiCodingAgentDistRoot.js";
import type { SlashMenuLeaf } from "./types.js";

interface PiToolDefinition {
  name: string;
  description: string;
  promptSnippet?: string;
}

interface PiToolsModule {
  createAllToolDefinitions(cwd: string): Record<string, PiToolDefinition>;
}

/**
 * Builds slash-menu leaves for Pi built-in tool definitions.
 *
 * @param cwd Current project working directory.
 * @returns Built-in tool leaves sorted by tool name.
 */
export async function createBuiltinToolLeaves(cwd: string): Promise<SlashMenuLeaf[]> {
  const modulePath = join(getPiCodingAgentDistRoot(), "core", "tools", "index.js");
  const module = await import(pathToFileURL(modulePath).href) as PiToolsModule;
  return Object.values(module.createAllToolDefinitions(cwd))
    .map((tool) => ({
      kind: "entry" as const,
      label: tool.name,
      description: normalizeBuiltinToolDescription(tool.promptSnippet ?? tool.description),
      groupLabel: "Core",
      sourcePath: `builtin:${tool.name}`,
      sourceScope: "project" as const,
      value: tool.name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: "base" }));
}

/**
 * Normalizes one built-in tool description for compact menu display.
 *
 * @param description Raw built-in tool description.
 * @returns Single-line description text.
 */
function normalizeBuiltinToolDescription(description: string): string {
  const normalized = description.trim().replace(/\s+/gu, " ");
  return normalized.length > 0 ? normalized : "No description";
}
