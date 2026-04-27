import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { ToolCallBlock } from "../../../../tron/toolcalls/types.js";
import { createTreeToolCallLines } from "./createTreeToolCallLines.js";
import type { TreeConversationLeaf } from "./types.js";

/**
 * Creates tool-call child rows for a tree conversation.
 *
 * @param parentUserId Parent user entry id.
 * @param toolCall Tool-call content block.
 * @param resultContent Tool result content.
 * @param theme UI theme.
 * @param focusEntryId Session entry id focused on enter.
 * @param showTopBorder Whether to render the top border.
 * @param showBottomBorder Whether to render the bottom border.
 * @returns Tool-call tree leaf.
 */
export function createTreeToolCallLeaves(
  parentUserId: string,
  toolCall: ToolCallBlock,
  resultContent: unknown,
  theme: ExtensionCommandContext["ui"]["theme"],
  focusEntryId: string,
  showTopBorder: boolean,
  showBottomBorder: boolean,
): TreeConversationLeaf[] {
  return [{
    kind: "entry",
    label: createTreeToolCallLines(toolCall, resultContent, theme, showTopBorder, showBottomBorder).join("\n"),
    description: "",
    value: toolCall.id,
    preserveLabelWhitespace: true,
    treeParentUserId: parentUserId,
    treeFocusEntryId: focusEntryId,
    treeRole: "tool",
  }];
}
