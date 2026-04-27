import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { colorToolCallIcon } from "../../../../tron/colors/colorToolCallIcon.js";
import { getThinkingPreview } from "../../../../tron/thinking/getThinkingPreview.js";
import type { TreeConversationLeaf } from "./types.js";

const THINKING_ICON = "󰧑";
const THINKING_BOX_WIDTH = 86;

/**
 * Creates Tron-style assistant-thinking child rows for a tree conversation.
 *
 * @param parentUserId Parent user entry id.
 * @param assistantEntryId Assistant entry id.
 * @param thinking Assistant thinking text.
 * @param index Thinking row index for the assistant entry.
 * @param uiTheme UI theme.
 * @returns Thinking tree leaves.
 */
export function createTreeThinkingLeaves(parentUserId: string, assistantEntryId: string, thinking: string, index: number, uiTheme: ExtensionCommandContext["ui"]["theme"]): TreeConversationLeaf[] {
  const innerWidth = THINKING_BOX_WIDTH;
  const preview = getThinkingPreview(thinking.trim());
  const contentWidth = Math.max(1, innerWidth - visibleWidth(THINKING_ICON) - 1);
  const content = truncateToWidth(preview, contentWidth, "…");
  const plainLine = `${THINKING_ICON} ${content}`;
  const padding = " ".repeat(Math.max(0, innerWidth - visibleWidth(plainLine)));
  return [
    createThinkingLeaf(parentUserId, `${assistantEntryId}:thinking:${index}:top`, `  ${uiTheme.fg("borderMuted", `┌${"─".repeat(innerWidth)}┐`)}`),
    createThinkingLeaf(parentUserId, `${assistantEntryId}:thinking:${index}:body`, `  ${uiTheme.fg("borderMuted", "│")}${colorToolCallIcon(THINKING_ICON)} ${uiTheme.italic(uiTheme.fg("toolOutput", content))}${padding}${uiTheme.fg("borderMuted", "│")}`),
    createThinkingLeaf(parentUserId, `${assistantEntryId}:thinking:${index}:bottom`, `  ${uiTheme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`)}`),
  ];
}

/**
 * Creates one thinking display row.
 *
 * @param parentUserId Parent user entry id.
 * @param value Unique item value.
 * @param label Rendered label.
 * @returns Thinking tree leaf.
 */
function createThinkingLeaf(parentUserId: string, value: string, label: string): TreeConversationLeaf {
  return {
    kind: "entry",
    label,
    description: "",
    value,
    preserveLabelWhitespace: true,
    treeParentUserId: parentUserId,
    treeFocusEntryId: value.split(":thinking:")[0],
    treeRole: "thinking",
  };
}
