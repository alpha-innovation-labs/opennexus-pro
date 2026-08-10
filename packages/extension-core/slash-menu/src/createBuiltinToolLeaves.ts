import { createPiToolDefinitions } from "@nexus/pi-platform/tools/createPiToolDefinitions";
import type { SlashMenuLeaf } from "./types";

/**
 * Builds slash-menu leaves for Pi built-in tool definitions.
 *
 * @param cwd Current project working directory.
 * @returns Built-in tool leaves sorted by tool name.
 */
export async function createBuiltinToolLeaves(cwd: string): Promise<SlashMenuLeaf[]> {
  return Object.values(createPiToolDefinitions(cwd))
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
