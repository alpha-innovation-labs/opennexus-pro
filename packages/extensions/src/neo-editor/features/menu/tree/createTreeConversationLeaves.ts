import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { getThinkingText } from "../../../../tron/toolcalls/getThinkingText.js";
import { isToolCallBlock } from "../../../../tron/toolcalls/isToolCallBlock.js";
import { createTreeThinkingLeaves } from "./createTreeThinkingLeaves.js";
import { createTreeToolCallLeaves } from "./createTreeToolCallLeaves.js";
import { createTreeUserLeaf } from "./createTreeUserLeaf.js";
import type { FlatTreeNode, TreeConversationLeaf } from "./types.js";

/**
 * Builds collapsible user conversation rows with assistant thinking and tool children.
 *
 * @param nodes Flat session tree nodes.
 * @param expandedUserIds Expanded user entry ids.
 * @param theme UI theme.
 * @returns Tree menu leaves.
 */
export function createTreeConversationLeaves(nodes: FlatTreeNode[], expandedUserIds: ReadonlySet<string>, theme: ExtensionCommandContext["ui"]["theme"]): TreeConversationLeaf[] {
  const leaves: TreeConversationLeaf[] = [];
  const toolResultContent = collectToolResultContent(nodes);
  let currentUserId = "";
  let userIndex = 0;
  for (const node of nodes) {
    if (node.entry.type !== "message") continue;
    if (node.entry.message?.role === "user") {
      userIndex += 1;
      currentUserId = node.entry.id;
      leaves.push(createTreeUserLeaf(node.entry, expandedUserIds.has(node.entry.id), userIndex, theme));
      continue;
    }
    if (!currentUserId || !expandedUserIds.has(currentUserId) || node.entry.message?.role !== "assistant") continue;
    const thinking = getThinkingText(node.entry.message.content);
    if (thinking) leaves.push(...createTreeThinkingLeaves(currentUserId, node.entry.id, thinking, leaves.length, theme));
    const content = Array.isArray(node.entry.message.content) ? node.entry.message.content : [];
    const toolCalls = content.filter(isToolCallBlock);
    for (const [index, block] of toolCalls.entries()) {
      leaves.push(...createTreeToolCallLeaves(currentUserId, block, toolResultContent.get(block.id), theme, node.entry.id, index === 0, index === toolCalls.length - 1));
    }
  }
  return leaves;
}

/**
 * Collects tool result content by tool-call id.
 *
 * @param nodes Flat session tree nodes.
 * @returns Result content by tool-call id.
 */
function collectToolResultContent(nodes: FlatTreeNode[]): Map<string, unknown> {
  const result = new Map<string, unknown>();
  for (const node of nodes) {
    const message = node.entry.message;
    if (node.entry.type !== "message" || message?.role !== "toolResult" || !message.toolCallId) continue;
    result.set(message.toolCallId, message.content);
  }
  return result;
}
