import { getMarkdownTheme } from "@earendil-works/pi-coding-agent";
import { Markdown } from "@earendil-works/pi-tui";
import { theme } from "../theme-proxy.js";
import { BorderedToolResult } from "../compact-tool-lines/BorderedToolResult.ts";
import { CompactToolResult } from "../compact-tool-lines/CompactToolResult.ts";
import { FailedToolCallResult } from "../compact-tool-lines/FailedToolCallResult.ts";
import { getToolErrorText } from "../compact-tool-lines/getToolErrorText.ts";
import { renderSummary } from "../compact-tool-lines/renderSummary.js";
import { summarizeArgs } from "../compact-tool-lines/summarizeArgs.js";
import { ThinkingLabelBlock } from "../thinking/ThinkingLabelBlock.ts";
import { getThinkingPreview } from "../thinking/getThinkingPreview.ts";
import { toPlainTextLines } from "../toolcalls/toPlainTextLines.js";
import { ErrorRenderer, StaticEntryRenderer, UserMessageRenderer } from "./renderers.ts";
import type { RenderContext, RenderTranscriptEntryResult, TranscriptEntry } from "./types.ts";

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
          { color: (value: string) => theme.fg("toolOutput", value), italic: true },
        );
        return {
          renderer: markdown,
          component: markdown,
          meta: { hasAttachedResult: false, drawsOwnBottomBorder: !connectToTools },
        };
      }
      const block = new ThinkingLabelBlock(getThinkingPreview(entry.text), connectToTools, connectFromTool);
      return {
        renderer: block,
        component: block,
        meta: { hasAttachedResult: false, drawsOwnBottomBorder: !connectToTools },
      };
    }
    case "tool": {
      const toolCallId = entry.toolCallId ?? `${entry.toolName ?? "tool"}-${entry.createdAt ?? 0}`;
      const toolName = entry.toolName ?? "tool";
      const hasAttachedResult = context.expanded ?? false;
      const renderer = renderSummary(toolCallId, toolName, summarizeArgs(toolName, entry.args ?? {}), context.theme, hasAttachedResult);
      return {
        renderer,
        meta: { hasAttachedResult, drawsOwnBottomBorder: !hasAttachedResult },
      };
    }
    case "toolResult": {
      const toolCallId = entry.toolCallId ?? `${entry.toolName ?? "tool"}-${entry.createdAt ?? 0}`;
      const toolName = entry.toolName ?? "tool";

      if (entry.result?.isError) {
        const renderer = new FailedToolCallResult(toolCallId, toolName, getToolErrorText(entry.result), context.theme);
        return { renderer, meta: { hasAttachedResult: false, drawsOwnBottomBorder: true } };
      }

      if (!context.expanded) {
        return { renderer: new StaticEntryRenderer([]), meta: { hasAttachedResult: false, drawsOwnBottomBorder: false } };
      }

      if (context.resultChildRenderer) {
        const renderer = new BorderedToolResult(toolCallId, context.resultChildRenderer, context.theme);
        return { renderer, meta: { hasAttachedResult: false, drawsOwnBottomBorder: true } };
      }

      const renderer = new CompactToolResult(toolCallId, entry.result, true, context.theme);
      return { renderer, meta: { hasAttachedResult: false, drawsOwnBottomBorder: true } };
    }
    case "error": {
      return {
        renderer: new ErrorRenderer(entry.text, context.theme),
        meta: { hasAttachedResult: false, drawsOwnBottomBorder: false },
      };
    }
    case "assistant":
    case "system": {
      const markdown = new Markdown(entry.text.trim(), context.xOffset ?? 0, 0, context.markdownTheme ?? getMarkdownTheme());
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
