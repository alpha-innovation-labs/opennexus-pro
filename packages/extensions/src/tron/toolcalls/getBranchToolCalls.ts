import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { USER_HEADER_PREFIX } from "./constants.js";
import { getGroupDurationLabel } from "./getGroupDurationLabel.js";
import { getMessagePreview } from "./getMessagePreview.js";
import { getThinkingText } from "./getThinkingText.js";
import { isToolCallBlock } from "./isToolCallBlock.js";
import { mergeAssistantThinking } from "./mergeAssistantThinking.js";
import { summarizeToolCall } from "./summarizeToolCall.js";
import type { BranchToolCalls, ToolCallGroup, ToolCallInfo } from "./types.js";

/**
 * Collects tool calls from the current branch for modal browsing.
 *
 * @param ctx Pi command context.
 * @returns Modal source payload when tool calls exist.
 */
export function getBranchToolCalls(ctx: ExtensionCommandContext): BranchToolCalls | undefined {
	const branch = ctx.sessionManager.getBranch();
	const toolCallMap = new Map<string, ToolCallInfo>();
	const groupedItems: ToolCallGroup[] = [];
	let assistantIndex = 0;
	let userIndex = 0;
	let currentUserPreview = "";
	let pendingAssistantThinking = "";
	let currentGroup: ToolCallGroup = { userIndex: 0, userPreview: "", toolCalls: [] };
	for (const entry of branch) {
		if (entry.type !== "message") continue;
		if (entry.message.role === "user") {
			userIndex += 1;
			currentUserPreview = getMessagePreview(entry.message.content, 120) || `(user message #${userIndex})`;
			pendingAssistantThinking = "";
			currentGroup = {
				userIndex,
				userPreview: currentUserPreview,
				userTimestamp: entry.message.timestamp,
				toolCalls: [],
			};
			groupedItems.push(currentGroup);
			continue;
		}
		if (entry.message.role === "assistant") {
			assistantIndex += 1;
			currentGroup.lastAssistantTimestamp = entry.message.timestamp;
			const content = Array.isArray(entry.message.content) ? entry.message.content : [];
			const toolCalls = content.filter(isToolCallBlock);
			const assistantPreview = getMessagePreview(content);
			const assistantThinking = getThinkingText(content);
			const mergedThinking = mergeAssistantThinking(pendingAssistantThinking, assistantThinking);
			if (toolCalls.length === 0) {
				pendingAssistantThinking = mergedThinking;
				continue;
			}
			for (const toolCall of toolCalls) {
				const info: ToolCallInfo = {
					toolCallId: toolCall.id,
					toolName: toolCall.name,
					arguments: toolCall.arguments,
					assistantIndex,
					assistantPreview,
					assistantThinking: mergedThinking,
					userIndex,
					userPreview: currentUserPreview,
				};
				toolCallMap.set(toolCall.id, info);
				currentGroup.toolCalls.push(info);
			}
			pendingAssistantThinking = "";
			continue;
		}
		if (entry.message.role === "toolResult") {
			const current = toolCallMap.get(entry.message.toolCallId);
			if (!current) continue;
			current.result = {
				isError: entry.message.isError,
				content: entry.message.content,
				details: entry.message.details,
			};
		}
	}
	const nonEmptyGroups = groupedItems.filter((group) => group.toolCalls.length > 0);
	if (nonEmptyGroups.length === 0) return undefined;
	const items: AutocompleteItem[] = [];
	for (const group of [...nonEmptyGroups].reverse()) {
		items.push({
			label: group.userPreview,
			value: `${USER_HEADER_PREFIX}${group.userIndex}`,
			description: getGroupDurationLabel(group.userTimestamp, group.lastAssistantTimestamp),
		});
		for (const toolCall of [...group.toolCalls].reverse()) {
			items.push({ label: summarizeToolCall(toolCall), value: toolCall.toolCallId });
		}
	}
	return { items, groups: nonEmptyGroups, toolCalls: toolCallMap };
}
