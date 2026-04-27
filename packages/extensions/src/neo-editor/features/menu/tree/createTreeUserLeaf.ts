import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { getMessagePreview } from "../../../../tron/toolcalls/getMessagePreview.js";
import { createTreeUserLines } from "./createTreeUserLines.js";
import type { TreeConversationLeaf, TreeNode } from "./types.js";

/**
 * Creates the collapsible user row for a tree conversation.
 *
 * @param entry Session tree user entry.
 * @param expanded Whether child rows are visible.
 * @param fallbackIndex One-based user fallback index.
 * @param theme UI theme.
 * @returns User tree leaf.
 */
export function createTreeUserLeaf(entry: TreeNode["entry"], expanded: boolean, fallbackIndex: number, theme: ExtensionCommandContext["ui"]["theme"]): TreeConversationLeaf {
  const preview = getMessagePreview(entry.message?.content, 120) || `(user message #${fallbackIndex})`;
  return {
    kind: "entry",
    label: createTreeUserLines(preview, expanded, theme).join("\n"),
    description: "",
    value: entry.id,
    preserveLabelWhitespace: true,
    treeRole: "user",
  };
}
