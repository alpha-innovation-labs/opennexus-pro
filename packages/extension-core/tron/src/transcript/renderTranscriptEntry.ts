import { getMarkdownTheme } from "@earendil-works/pi-coding-agent";
import { AgentProgressCall, isAgentProgressTool } from "../compact-tool-lines/AgentProgressCall";
import { Markdown, Text } from "@earendil-works/pi-tui";
import { getResultText } from "../compact-tool-lines/getResultText";
import { BorderedToolResult } from "../compact-tool-lines/BorderedToolResult";
import { CompactToolResult } from "../compact-tool-lines/CompactToolResult";
import { createMutationToolDetails } from "../compact-tool-lines/createMutationToolDetails";
import { DiffRenderer } from "../compact-tool-lines/diff";
import { resetDiffScroll } from "../compact-tool-lines/diff/state";
import { resetOutputExpanded } from "../compact-tool-lines/ExpandableOutput";
import { FailedToolCallResult } from "../compact-tool-lines/FailedToolCallResult";
import { getToolErrorText } from "../compact-tool-lines/getToolErrorText";
import { renderSummary } from "../compact-tool-lines/renderSummary";
import { summarizeArgs } from "../compact-tool-lines/summarizeArgs";
import { theme } from "../theme-proxy";
import { getThinkingPreview } from "../thinking/getThinkingPreview";
import { ThinkingLabelBlock } from "../thinking/ThinkingLabelBlock";
import { BorderedThinkingBlock } from "../thinking/BorderedThinkingBlock";
import { toPlainTextLines } from "../toolcalls/toPlainTextLines";
import {
	ErrorRenderer,
	StaticEntryRenderer,
	UserMessageRenderer,
} from "./renderers";
import type {
	RenderContext,
	RenderTranscriptEntryResult,
	TranscriptEntry,
} from "./types";

/**
 * Creates a renderer for one transcript entry.
 *
 * @param entry Normalized transcript entry.
 * @param context Render context.
 * @returns Renderer and metadata for the entry.
 */
export function renderTranscriptEntry(
	entry: TranscriptEntry,
	context: RenderContext,
): RenderTranscriptEntryResult {
	switch (entry.role) {
		case "user": {
			return {
				renderer: new UserMessageRenderer(entry.text),
				meta: { hasAttachedResult: false, drawsOwnBottomBorder: true },
			};
		}
		case "thinking": {
			const connectToTools = context.connectThinkingToTools ?? false;
			const connectFromTool = context.connectThinkingFromTool ?? false;
			if (context.expanded) {
				const markdown = new Markdown(
					entry.text.trim(),
					context.xOffset ?? 0,
					0,
					context.markdownTheme ?? getMarkdownTheme(),
					{
						color: (value: string) => theme.fg("toolOutput", value),
						italic: true,
					},
				);
				const block = new BorderedThinkingBlock(markdown, connectToTools, connectFromTool);
				return {
					renderer: block,
					component: block,
					meta: {
						hasAttachedResult: false,
						drawsOwnBottomBorder: !connectToTools,
					},
				};
			}
			const block = new ThinkingLabelBlock(
				getThinkingPreview(entry.text),
				connectToTools,
				connectFromTool,
			);
			return {
				renderer: block,
				component: block,
				meta: {
					hasAttachedResult: false,
					drawsOwnBottomBorder: !connectToTools,
				},
			};
		}
		case "tool": {
			const toolCallId =
				entry.toolCallId ??
				`${entry.toolName ?? "tool"}-${entry.createdAt ?? 0}`;
			const toolName = entry.toolName ?? "tool";
			if (isAgentProgressTool(toolName) && context.callChildRenderer) {
				return {
					renderer: new AgentProgressCall(toolCallId, context.callChildRenderer, context.theme),
					meta: { hasAttachedResult: true, drawsOwnBottomBorder: false },
				};
			}
			const hasAttachedResult = isAgentProgressTool(toolName) || (context.expanded ?? false);
			const renderer = renderSummary(
				toolCallId,
				toolName,
				summarizeArgs(toolName, entry.args ?? {}),
				context.theme,
				hasAttachedResult,
			);
			return {
				renderer,
				meta: { hasAttachedResult, drawsOwnBottomBorder: !hasAttachedResult },
			};
		}
		case "toolResult": {
			const toolCallId =
				entry.toolCallId ??
				`${entry.toolName ?? "tool"}-${entry.createdAt ?? 0}`;
			const toolName = entry.toolName ?? "tool";

			if (entry.result?.isError && !isAgentProgressTool(toolName)) {
				const renderer = new FailedToolCallResult(
					toolCallId,
					toolName,
					getToolErrorText(entry.result as never),
					context.theme,
				);
				return {
					renderer,
					meta: { hasAttachedResult: false, drawsOwnBottomBorder: true },
				};
			}

			if (!context.expanded && !isAgentProgressTool(toolName)) {
				// Reset the diff body scroll AND the "show more" expand flag so a fresh
				// re-expansion starts at the top, collapsed (preview + button).
				if (toolName === "edit") resetDiffScroll(toolCallId);
				resetOutputExpanded(toolCallId);
				return {
					renderer: new StaticEntryRenderer([]),
					meta: { hasAttachedResult: false, drawsOwnBottomBorder: false },
				};
			}

			const resultChild = createMutationToolDetails(toolName, entry.args, entry.result?.details, context.theme, toolCallId)
				?? context.resultChildRenderer
				?? (context.toolOutputScrollState ? new Text(getResultText(entry.result as never), 0, 0) : undefined);

			if (resultChild) {
				// A DiffRenderer owns its own row-cap + "show all" button (no wheel
				// scroll). Wrapping it in a second ToolOutputViewport would double-cap
				// it, size the scrollbar to the capped length instead of the true one,
				// and clip the button at wide widths. Skip the viewport for diffs.
				const scrollable = !(resultChild instanceof DiffRenderer) && context.expanded;
				const renderer = new BorderedToolResult(
					toolCallId,
					resultChild,
					context.theme,
					scrollable ? context.toolOutputScrollState : undefined,
				);
				return {
					renderer,
					meta: { hasAttachedResult: false, drawsOwnBottomBorder: true },
				};
			}

			const renderer = new CompactToolResult(
				toolCallId,
				entry.result as never,
				true,
				context.theme,
			);
			return {
				renderer,
				meta: { hasAttachedResult: false, drawsOwnBottomBorder: true },
			};
		}
		case "error": {
			return {
				renderer: new ErrorRenderer(entry.text, context.theme),
				meta: { hasAttachedResult: false, drawsOwnBottomBorder: false },
			};
		}
		case "assistant":
		case "system": {
			const markdown = new Markdown(
				entry.text.trim(),
				context.xOffset ?? 0,
				0,
				context.markdownTheme ?? getMarkdownTheme(),
			);
			return {
				renderer: markdown,
				component: markdown,
				meta: { hasAttachedResult: false, drawsOwnBottomBorder: false },
			};
		}
		default: {
			const lines = toPlainTextLines(entry.text);
			return {
				renderer: new StaticEntryRenderer(lines),
				meta: { hasAttachedResult: false, drawsOwnBottomBorder: false },
			};
		}
	}
}
