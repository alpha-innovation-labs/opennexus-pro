import { getMarkdownTheme } from "@mariozechner/pi-coding-agent";
import { Markdown, Spacer, Text } from "@mariozechner/pi-tui";
import { setAssistantMessageUpdateHook } from "/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import { theme } from "/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/theme/theme.js";
import { bridgeThinkingToToolCalls } from "../activity/bridgeThinkingToToolCalls.ts";
import { getImmediateFollowingToolCallIds } from "../activity/getImmediateFollowingToolCallIds.ts";
import { getAssistantMessageTiming } from "./assistantMessageTimingState.ts";
import { createAssistantMetaText } from "./createAssistantMetaText.ts";
import { getThinkingPreview } from "./getThinkingPreview.ts";
import { ThinkingLabelBlock } from "./ThinkingLabelBlock.ts";

/**
 * Installs the tron assistant-thinking renderer hook.
 */
export function installAssistantThinkingStyle(): void {
	setAssistantMessageUpdateHook((component: any, message: any) => {
		component.lastMessage = message;
		component.contentContainer.clear();
		const markdownTheme = component.markdownTheme ?? getMarkdownTheme();
		const hasVisibleContent = message.content.some((content: any) => (content.type === "text" && content.text.trim()) || (content.type === "thinking" && content.thinking.trim()));
		const shouldAddTopSpacer = hasVisibleContent && !message.content.some((content: any) => content.type === "toolCall");
		if (shouldAddTopSpacer) component.contentContainer.addChild(new Spacer(1));
		for (let index = 0; index < message.content.length; index++) {
			const content = message.content[index];
			if (content.type === "text" && content.text.trim()) {
				component.contentContainer.addChild(new Markdown(content.text.trim(), 1, 0, markdownTheme));
				continue;
			}
			if (content.type === "thinking" && content.thinking.trim()) {
				const hasVisibleContentAfter = message.content.slice(index + 1).some((next: any) => (next.type === "text" && next.text.trim()) || (next.type === "thinking" && next.thinking.trim()));
				const followingToolCallIds = getImmediateFollowingToolCallIds(message.content, index);
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
		component.hasToolCalls = message.content.some((content: any) => content.type === "toolCall");
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
