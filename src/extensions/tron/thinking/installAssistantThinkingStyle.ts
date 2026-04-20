import { getMarkdownTheme } from "@mariozechner/pi-coding-agent";
import { Markdown, Spacer, Text } from "@mariozechner/pi-tui";
import { setAssistantMessageUpdateHook } from "../../../pi-internals/assistantMessageHook.js";
import { theme } from "../../../pi-internals/theme.js";
import { bridgeThinkingToToolCalls } from "../activity/bridgeThinkingToToolCalls.ts";
import { getAssistantMessageTiming } from "./assistantMessageTimingState.ts";
import { createAssistantMetaText } from "./createAssistantMetaText.ts";
import { getThinkingPreview } from "./getThinkingPreview.ts";
import { ThinkingLabelBlock } from "./ThinkingLabelBlock.ts";

/**
 * Returns whether a tool call should remain visible in Tron assistant layout.
 *
 * @param content Assistant message content block.
 * @returns True when the tool call should affect thinking/tool layout.
 */
function isVisibleToolCall(content: any): boolean {
	return content?.type === "toolCall" && content?.name !== "Agent";
}

/**
 * Returns visible tool-call ids that immediately follow a thinking block.
 *
 * @param content Assistant message content blocks.
 * @param index Thinking block index.
 * @returns Visible tool call ids.
 */
function getVisibleFollowingToolCallIds(content: any[], index: number): string[] {
	const toolCallIds: string[] = [];

	for (let nextIndex = index + 1; nextIndex < content.length; nextIndex += 1) {
		const next = content[nextIndex];
		if (!next) continue;
		if (next.type === "toolCall") {
			if (isVisibleToolCall(next) && typeof next.id === "string" && next.id) {
				toolCallIds.push(next.id);
			}
			continue;
		}
		if (next.type === "text" && typeof next.text === "string" && next.text.trim()) return [];
		if (next.type === "thinking" && typeof next.thinking === "string" && next.thinking.trim()) return [];
		if (toolCallIds.length > 0) return toolCallIds;
	}

	return toolCallIds;
}

/**
 * Installs the tron assistant-thinking renderer hook.
 */
export function installAssistantThinkingStyle(): void {
	setAssistantMessageUpdateHook((component: any, message: any) => {
		component.lastMessage = message;
		component.contentContainer.clear();
		const markdownTheme = component.markdownTheme ?? getMarkdownTheme();
		const hasVisibleContent = message.content.some((content: any) => (content.type === "text" && content.text.trim()) || (content.type === "thinking" && content.thinking.trim()));
		const hasVisibleToolCalls = message.content.some((content: any) => isVisibleToolCall(content));
		const shouldAddTopSpacer = hasVisibleContent && !hasVisibleToolCalls;
		if (shouldAddTopSpacer) component.contentContainer.addChild(new Spacer(1));
		for (let index = 0; index < message.content.length; index++) {
			const content = message.content[index];
			if (content.type === "text" && content.text.trim()) {
				component.contentContainer.addChild(new Markdown(content.text.trim(), 1, 0, markdownTheme));
				continue;
			}
			if (content.type === "thinking" && content.thinking.trim()) {
				const hasVisibleContentAfter = message.content.slice(index + 1).some((next: any) => (next.type === "text" && next.text.trim()) || (next.type === "thinking" && next.thinking.trim()));
				const followingToolCallIds = getVisibleFollowingToolCallIds(message.content, index);
				if (followingToolCallIds.length > 0) bridgeThinkingToToolCalls(followingToolCallIds);
				if (component.hideThinkingBlock) {
					component.contentContainer.addChild(new ThinkingLabelBlock(getThinkingPreview(content.thinking.trim()), followingToolCallIds.length > 0));
				} else {
					component.contentContainer.addChild(new Markdown(content.thinking.trim(), 1, 0, markdownTheme, {
						color: (value) => theme.fg("toolOutput", value),
						italic: true,
					}));
				}
				if (hasVisibleContentAfter) component.contentContainer.addChild(new Spacer(1));
			}
		}
		component.hasToolCalls = hasVisibleToolCalls;
		const durationLabel = typeof message.timestamp === "number" ? getAssistantMessageTiming(message.timestamp) : undefined;
		if (hasVisibleContent && !component.hasToolCalls && durationLabel) {
			component.contentContainer.addChild(new Spacer(1));
			component.contentContainer.addChild(createAssistantMetaText(theme, durationLabel));
		}
		if (!component.hasToolCalls && message.stopReason === "aborted") {
			const abortMessage = message.errorMessage && message.errorMessage !== "Request was aborted" ? message.errorMessage : "Operation aborted";
			component.contentContainer.addChild(new Spacer(1));
			component.contentContainer.addChild(new Text(theme.fg("error", abortMessage), 1, 0));
		}
		if (!component.hasToolCalls && message.stopReason === "error") {
			const errorMessage = message.errorMessage || "Unknown error";
			component.contentContainer.addChild(new Spacer(1));
			component.contentContainer.addChild(new Text(theme.fg("error", `Error: ${errorMessage}`), 1, 0));
		}
	});
}
