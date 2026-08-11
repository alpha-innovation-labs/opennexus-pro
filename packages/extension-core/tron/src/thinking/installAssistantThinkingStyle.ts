import type { AssistantMessage } from "@earendil-works/pi-ai";
import { getMarkdownTheme } from "@earendil-works/pi-coding-agent";
import { Spacer, Text } from "@earendil-works/pi-tui";
import { setAssistantMessageUpdateHook } from "@nexus/pi-platform/assistantMessageHook";
import type { AssistantMessageComponent } from "@earendil-works/pi-coding-agent";
import { bridgeThinkingToToolCalls } from "../activity/bridgeThinkingToToolCalls";
import { getImmediateFollowingToolCallGroup } from "../activity/getImmediateFollowingToolCallGroup";
import { syncToolCallFrameState } from "../activity/syncToolCallFrameState";
import { setCompactModeThinkingExpanded } from "../collapse/thinkingVisibility";
import { recordTronRenderTiming } from "../profiling/recordTronRenderTiming";
import { theme } from "../theme-proxy";
import { renderTranscriptEntry } from "../transcript/renderTranscriptEntry";
import { getAssistantMessageTiming } from "./assistantMessageTimingState";
import { BorderedAssistantErrorRow } from "./BorderedAssistantErrorRow";
import { createAssistantMetaText } from "./createAssistantMetaText";
import { formatAssistantErrorText } from "./formatAssistantErrorText";
import { isThinkingOnlyVisibleMessage } from "./isThinkingOnlyVisibleMessage";

/**
 * Returns whether a tool call should remain visible in Tron assistant layout.
 *
 * @param content Assistant message content block.
 * @returns True when the tool call should affect thinking/tool layout.
 */
function isVisibleToolCall(content: { type?: string; name?: string }): boolean {
	return content?.type === "toolCall" && content?.name !== "Agent";
}

/**
 * Installs the tron assistant-thinking renderer hook.
 */
export function installAssistantThinkingStyle(): void {
	setAssistantMessageUpdateHook(
		(component: AssistantMessageComponent, message: AssistantMessage | undefined) => {
			if (!message) return;
			const startedAt = performance.now();
			component.lastMessage = message;
			component.contentContainer.clear();
			syncToolCallFrameState(message.content);
			const markdownTheme = component.markdownTheme ?? getMarkdownTheme();
			const hasVisibleContent = message.content.some(
				(content: { type?: string; text?: string; thinking?: string }) =>
					(content.type === "text" && content.text?.trim()) ||
					(content.type === "thinking" && content.thinking?.trim()),
			);
			const hasVisibleToolCalls = message.content.some((content: { type?: string; name?: string }) =>
				isVisibleToolCall(content),
			);
			const shouldTightenThinkingOuterSpacing =
				isThinkingOnlyVisibleMessage(message);
			const _shouldAddTopSpacer =
				hasVisibleContent &&
				!hasVisibleToolCalls &&
				!shouldTightenThinkingOuterSpacing;
			setCompactModeThinkingExpanded(!component.hideThinkingBlock);

			// if (shouldAddTopSpacer) component.contentContainer.addChild(new Spacer(1));
			for (let index = 0; index < message.content.length; index++) {
				const content = message.content[index];
				if (content.type === "text" && content.text?.trim()) {
					const { component: child } = renderTranscriptEntry(
						{ role: "assistant", text: content.text.trim() },
						{ theme, markdownTheme, xOffset: 1 },
					);
					if (child) component.contentContainer.addChild(child);
					continue;
				}
				if (content.type === "thinking" && content.thinking?.trim()) {
					const hasVisibleContentAfter = message.content
						.slice(index + 1)
						.some(
							(next: { type?: string; text?: string; thinking?: string }) =>
								(next.type === "text" && next.text?.trim()) ||
								(next.type === "thinking" && next.thinking?.trim()),
						);
					const toolGroup = getImmediateFollowingToolCallGroup(
						message.content,
						index,
					);
					const connectToTools = toolGroup.toolCallIds.length > 0;
					const previousVisibleContent = message.content
						.slice(0, index)
						.findLast(
							(previous: { type?: string; text?: string; thinking?: string; name?: string }) =>
								isVisibleToolCall(previous) ||
								(previous.type === "text" && previous.text?.trim()) ||
								(previous.type === "thinking" && previous.thinking?.trim()),
						);
					const connectFromTool = isVisibleToolCall(previousVisibleContent);
					if (connectToTools)
						bridgeThinkingToToolCalls(
							toolGroup.toolCallIds,
							!toolGroup.followedByThinking,
						);
					if (component.hideThinkingBlock) {
						const { component: child } = renderTranscriptEntry(
							{ role: "thinking", text: content.thinking.trim() },
							{
								theme,
								markdownTheme,
								connectThinkingToTools: connectToTools,
								connectThinkingFromTool: connectFromTool,
							},
						);
						if (child) component.contentContainer.addChild(child);
					} else {
						const { component: child } = renderTranscriptEntry(
							{ role: "thinking", text: content.thinking.trim() },
							{
								theme,
								markdownTheme,
								expanded: true,
								connectThinkingToTools: connectToTools,
								connectThinkingFromTool: connectFromTool,
								xOffset: 1,
							},
						);
						if (child) component.contentContainer.addChild(child);
					}
					if (hasVisibleContentAfter)
						component.contentContainer.addChild(new Spacer(1));
				}
			}
			component.hasToolCalls = hasVisibleToolCalls;
			const durationLabel =
				typeof message.timestamp === "number"
					? getAssistantMessageTiming(message.timestamp)
					: undefined;
			if (hasVisibleContent && !component.hasToolCalls && durationLabel) {
				if (!shouldTightenThinkingOuterSpacing)
					component.contentContainer.addChild(new Spacer(1));
				component.contentContainer.addChild(
					createAssistantMetaText(theme, durationLabel, message.timestamp),
				);
			}
			if (!component.hasToolCalls && message.stopReason === "aborted") {
				const abortMessage =
					message.errorMessage && message.errorMessage !== "Request was aborted"
						? message.errorMessage
						: "Operation aborted";
				if (!shouldTightenThinkingOuterSpacing)
					component.contentContainer.addChild(new Spacer(1));
				component.contentContainer.addChild(
					new Text(theme.fg("error", abortMessage), 1, 0),
				);
			}
			if (!component.hasToolCalls && message.stopReason === "error") {
				const errorMessage = message.errorMessage || "Unknown error";
				component.contentContainer.addChild(
					new BorderedAssistantErrorRow(
						theme,
						formatAssistantErrorText(errorMessage),
					),
				);
			}
			recordTronRenderTiming(
				"assistant-update-content",
				performance.now() - startedAt,
				component.contentContainer.children?.length ?? 0,
				{
					contentBlocks: message.content.length,
					hasToolCalls: component.hasToolCalls,
				},
			);
		},
	);
}
