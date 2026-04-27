import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { createPlainTreeTheme } from "./tree/createPlainTreeTheme.js";
import { createTreeConversationLeaves } from "./tree/createTreeConversationLeaves.js";
import { flattenTreeNodes } from "./tree/flattenTreeNodes.js";
import type { TreeNode } from "./tree/types.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds collapsible tree navigation leaves from the current session tree.
 *
 * @param tree Session tree nodes.
 * @param expandedUserIds Expanded user message ids.
 * @param theme UI theme.
 * @returns Tree leaves.
 */
export function createTreeLeaves(tree: TreeNode[], expandedUserIds: ReadonlySet<string> = new Set(), theme?: ExtensionCommandContext["ui"]["theme"]): SlashMenuLeaf[] {
  return createTreeConversationLeaves(flattenTreeNodes(tree), expandedUserIds, theme ?? createPlainTreeTheme());
}
