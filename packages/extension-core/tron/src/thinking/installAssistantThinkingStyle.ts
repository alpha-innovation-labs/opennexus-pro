import type { AssistantMessage } from "@earendil-works/pi-ai";
import type {
	AssistantMessageComponent,
	Theme as PiTheme,
} from "@earendil-works/pi-coding-agent";
import { getMarkdownTheme } from "@earendil-works/pi-coding-agent";
import type { MarkdownTheme } from "@earendil-works/pi-tui";
import { Spacer, Text } from "@earendil-works/pi-tui";
import { NEXUS_TRON_ASSISTANT_FOOTER_FLAG } from "@nexus/pi-platform/applyAssistantFooterSpacingPatch";
import { setAssistantMessageUpdateHook } from "@nexus/pi-platform/assistantMessageHook";
import { bridgeThinkingToToolCalls } from "../activity/bridgeThinkingToToolCalls";
import { getImmediateFollowingToolCallGroup } from "../activity/getImmediateFollowingToolCallGroup";
import { syncToolCallFrameState } from "../activity/syncToolCallFrameState";
import { setCompactModeThinkingExpanded } from "../collapse/thinkingVisibility";
import { recordTronRenderTiming } from "../profiling/recordTronRenderTiming";
import { theme } from "../theme-proxy";
import { renderTranscriptEntry } from "../transcript/renderTranscriptEntry";
import { getAssistantMessageTiming } from "./assistantMessageTimingState";
import { BorderedAssistantErrorRow } from "./BorderedAssistantErrorRow";
import { BorderedAssistantText } from "./BorderedAssistantText";
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

function castComponent(c: AssistantMessageComponent): Record<
	string,
	unknown
> & {
	lastMessage: unknown;
	contentContainer: {
		clear(): void;
		addChild(c: unknown): void;
		children?: unknown[];
	};
	markdownTheme?: unknown;
	hideThinkingBlock: boolean;
	hasToolCalls: boolean;
} {
	return c as never;
}

/**
 * Installs the tron assistant-thinking renderer hook.
 */
export function installAssistantThinkingStyle(): void {
	setAssistantMessageUpdateHook(
		(
			component: AssistantMessageComponent,
			message: AssistantMessage | undefined,
		) => {
			if (!message) return;
			const startedAt = performance.now();
			const comp = castComponent(component);
			comp.lastMessage = message;
			comp.contentContainer.clear();
			comp[NEXUS_TRON_ASSISTANT_FOOTER_FLAG] = false;
			syncToolCallFrameState(message.content);
			const markdownTheme =
				comp.markdownTheme ?? (getMarkdownTheme() as MarkdownTheme);
			const hasVisibleContent = message.content.some(
				(content: { type?: string; text?: string; thinking?: string }) =>
					(content.type === "text" && content.text?.trim()) ||
					(content.type === "thinking" && content.thinking?.trim()),
			);
			const hasVisibleToolCalls = message.content.some(
				(content: { type?: string; name?: string }) =>
					isVisibleToolCall(content),
			);
			const durationLabel =
				typeof message.timestamp === "number"
					? getAssistantMessageTiming(message.timestamp)
					: undefined;
			const showFooter =
				hasVisibleContent && !hasVisibleToolCalls && !!durationLabel;
			let lastTextIndex = -1;
			for (let index = 0; index < message.content.length; index++) {
				const block = message.content[index];
				if (block.type === "text" && block.text?.trim()) lastTextIndex = index;
			}
			const shouldTightenThinkingOuterSpacing =
				isThinkingOnlyVisibleMessage(message);
			const _shouldAddTopSpacer =
				hasVisibleContent &&
				!hasVisibleToolCalls &&
				!shouldTightenThinkingOuterSpacing;
			setCompactModeThinkingExpanded(!comp.hideThinkingBlock);

			// if (shouldAddTopSpacer) comp.contentContainer.addChild(new Spacer(1));
			for (let index = 0; index < message.content.length; index++) {
				const content = message.content[index];
				if (content.type === "text" && content.text?.trim()) {
					// Share the top wall with the collapsed thinking block directly above.
					const prev = message.content[index - 1];
					const connectFromThinking =
						comp.hideThinkingBlock &&
						prev?.type === "thinking" &&
						Boolean(prev.thinking?.trim());
					// Contiguous tool calls directly below share the text's bottom wall.
					const toolIdsAfter: string[] = [];
					for (let j = index + 1; j < message.content.length; j++) {
						const c = message.content[j] as
							| { type?: string; name?: string; id?: string }
							| undefined;
						if (c && isVisibleToolCall(c) && typeof c.id === "string" && c.id)
							toolIdsAfter.push(c.id);
						else break;
					}
					const hasToolCallsAfter = toolIdsAfter.length > 0;
					// An error/abort row after the text ends the chain: close with └┘, not ├─┤.
					const hasErrorAfter =
						message.stopReason === "error" || message.stopReason === "aborted";
					const connectToTools = hasToolCallsAfter && !hasErrorAfter;
					// Hide the following tools' top borders so they share the text's bottom wall.
					if (connectToTools) bridgeThinkingToToolCalls(toolIdsAfter, true);
					const bordered = new BorderedAssistantText(
						content.text.trim(),
						connectFromThinking,
						connectToTools,
						markdownTheme as MarkdownTheme,
						showFooter && index === lastTextIndex
							? `⏱ ${durationLabel}`
							: undefined,
					);
					comp.contentContainer.addChild(bordered);
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
					// Text is now bordered, so it joins the visual chain: the collapsed
					// thinking block must open a ├─┤ bottom wall into it.
					const hasTextAfter = message.content
						.slice(index + 1)
						.some(
							(next: { type?: string; text?: string }) =>
								next.type === "text" && next.text?.trim(),
						);
					const connectsBelow = connectToTools || hasTextAfter;
					const previousVisibleContent = message.content
						.slice(0, index)
						.findLast(
							(previous: {
								type?: string;
								text?: string;
								thinking?: string;
								name?: string;
							}) =>
								isVisibleToolCall(previous) ||
								(previous.type === "text" && previous.text?.trim()) ||
								(previous.type === "thinking" && previous.thinking?.trim()),
						);
					const connectFromTool = previousVisibleContent
						? isVisibleToolCall(previousVisibleContent)
						: false;
					if (connectToTools)
						bridgeThinkingToToolCalls(
							toolGroup.toolCallIds,
							!toolGroup.followedByThinking,
						);
					if (comp.hideThinkingBlock) {
						const { component: child } = renderTranscriptEntry(
							{ role: "thinking", text: content.thinking.trim() },
							{
								theme: theme as PiTheme,
								markdownTheme: markdownTheme as never,
								connectThinkingToTools: connectsBelow,
								connectThinkingFromTool: connectFromTool,
							},
						);
						if (child) comp.contentContainer.addChild(child);
					} else {
						const { component: child } = renderTranscriptEntry(
							{ role: "thinking", text: content.thinking.trim() },
							{
								theme: theme as PiTheme,
								markdownTheme: markdownTheme as never,
								expanded: true,
								connectThinkingToTools: connectsBelow,
								connectThinkingFromTool: connectFromTool,
								xOffset: 1,
							},
						);
						if (child) comp.contentContainer.addChild(child);
					}
					if (
						hasVisibleContentAfter &&
						!(comp.hideThinkingBlock && connectsBelow)
					)
						comp.contentContainer.addChild(new Spacer(1));
				}
			}
			comp.hasToolCalls = hasVisibleToolCalls;
			if (showFooter) {
				// The footer sits on the last bordered text box's bottom border. A
				// thinking-only message has no text box, so keep a standalone line.
				if (lastTextIndex === -1) {
					comp.contentContainer.addChild(
						createAssistantMetaText(
							theme as PiTheme,
							durationLabel,
							message.timestamp,
						),
					);
				}
				comp[NEXUS_TRON_ASSISTANT_FOOTER_FLAG] = true;
			}
			if (!comp.hasToolCalls && message.stopReason === "aborted") {
				const abortMessage =
					message.errorMessage && message.errorMessage !== "Request was aborted"
						? message.errorMessage
						: "Operation aborted";
				if (!shouldTightenThinkingOuterSpacing)
					comp.contentContainer.addChild(new Spacer(1));
				comp.contentContainer.addChild(
					new Text((theme as PiTheme).fg("error", abortMessage), 1, 0),
				);
			}
			if (!comp.hasToolCalls && message.stopReason === "error") {
				const errorMessage = message.errorMessage || "Unknown error";
				comp.contentContainer.addChild(
					new BorderedAssistantErrorRow(
						theme as PiTheme,
						formatAssistantErrorText(errorMessage),
					),
				);
			}
			recordTronRenderTiming(
				"assistant-update-content",
				performance.now() - startedAt,
				comp.contentContainer.children?.length ?? 0,
				{
					contentBlocks: message.content.length,
					hasToolCalls: comp.hasToolCalls,
				},
			);
		},
	);
}
