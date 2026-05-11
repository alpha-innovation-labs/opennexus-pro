import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { formatToolGroupLabel } from "./formatToolGroupLabel.js";
import type { SlashMenuLeaf } from "./types.js";

type ToolInfo = ReturnType<ExtensionAPI["getAllTools"]>[number];

/**
 * Builds slash-menu leaves for available tools.
 *
 * @param tools Tool metadata returned by the active Pi runtime.
 * @param supplementalLeaves Tool leaves from built-in definitions.
 * @returns Tool list leaves sorted by tool name.
 */
export function createToolLeaves(tools: ToolInfo[], supplementalLeaves: SlashMenuLeaf[] = []): SlashMenuLeaf[] {
  const leaves = [
    ...supplementalLeaves,
    ...tools.map((tool) => ({
      kind: "entry" as const,
      label: tool.name,
      description: normalizeToolDescription(tool.description),
      groupLabel: formatToolGroupLabel(tool.sourceInfo),
      sourcePath: tool.sourceInfo.path,
      sourceScope: tool.sourceInfo.scope,
      value: tool.name,
    })),
  ];

  return dedupeToolLeaves(leaves).sort(compareToolLeaves);
}

/**
 * Deduplicates tool leaves by label while preserving the first source.
 *
 * @param leaves Tool leaves to deduplicate.
 * @returns Deduplicated tool leaves.
 */
function dedupeToolLeaves(leaves: SlashMenuLeaf[]): SlashMenuLeaf[] {
  const deduped = new Map<string, SlashMenuLeaf>();
  for (const leaf of leaves) {
    if (!deduped.has(leaf.label)) deduped.set(leaf.label, leaf);
  }
  return [...deduped.values()];
}

/**
 * Compares tool leaves by group then label.
 *
 * @param left Left tool leaf.
 * @param right Right tool leaf.
 * @returns Sort comparison result.
 */
function compareToolLeaves(left: SlashMenuLeaf, right: SlashMenuLeaf): number {
  return getToolGroupRank(left.groupLabel) - getToolGroupRank(right.groupLabel)
    || (left.groupLabel ?? "").localeCompare(right.groupLabel ?? "", undefined, { sensitivity: "base" })
    || left.label.localeCompare(right.label, undefined, { sensitivity: "base" });
}

/**
 * Gives Core the first group position.
 *
 * @param groupLabel Visible group label.
 * @returns Numeric group rank.
 */
function getToolGroupRank(groupLabel: string | undefined): number {
  return groupLabel === "Core" ? 0 : 1;
}

/**
 * Normalizes one tool description for compact menu display.
 *
 * @param description Raw tool description.
 * @returns Single-line description text.
 */
function normalizeToolDescription(description: string): string {
  const normalized = description.trim().replace(/\s+/gu, " ");
  return normalized.length > 0 ? normalized : "No description";
}
