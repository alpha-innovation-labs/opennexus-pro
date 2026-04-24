import { getMarkdownTheme } from "@mariozechner/pi-coding-agent";
import { Markdown } from "@mariozechner/pi-tui";
import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import stripAnsi from "strip-ansi";
import { syncToolCallFrameState } from "../../tron/activity/syncToolCallFrameState.js";
import { renderSummary } from "../../tron/compact-tool-lines/renderSummary.js";
import { summarizeArgs } from "../../tron/compact-tool-lines/summarizeArgs.js";
import { ThinkingLabelBlock } from "../../tron/thinking/ThinkingLabelBlock.ts";
import { getThinkingPreview } from "../../tron/thinking/getThinkingPreview.ts";
import { toPlainTextLines } from "../../tron/toolcalls/toPlainTextLines.js";
import { renderCompactInputBubble } from "../../tron/user-message/renderCompactInputBubble.ts";
import type { SubagentRun, SubagentTranscriptEntry } from "../types.js";

/**
 * Renders markdown transcript content into terminal lines.
 *
 * @param text Markdown text.
 * @param width Available width.
 * @returns Rendered markdown lines.
 */
function renderMarkdownTranscript(text: string, width: number): string[] {
  return new Markdown(text.trim(), 0, 0, getMarkdownTheme()).render(width);
}

/**
 * Returns whether one transcript join should keep a blank separator line.
 *
 * @param entry Current transcript entry.
 * @param nextEntry Next transcript entry.
 * @returns True when the join should keep a spacer.
 */
function shouldInsertTranscriptSpacer(entry: SubagentTranscriptEntry, nextEntry?: SubagentTranscriptEntry): boolean {
  return entry.role !== "thinking" && nextEntry?.role !== "thinking";
}

/**
 * Removes one closing border line so the next thinking box can absorb that join.
 *
 * @param lines Rendered transcript lines.
 * @returns Lines without a trailing closing border when present.
 */
function trimTrailingTranscriptBorder(lines: string[]): string[] {
  const lastLine = stripAnsi(lines.at(-1) ?? "").trimStart();
  if ((lastLine.startsWith("╰") && lastLine.endsWith("╯")) || (lastLine.startsWith("└") && lastLine.endsWith("┘"))) {
    return lines.slice(0, -1);
  }
  return lines;
}

/**
 * Renders one transcript tool entry with Tron compact call styling.
 *
 * @param theme Current UI theme.
 * @param width Available detail width.
 * @param entry Tool transcript entry.
 * @returns Styled tool-call lines.
 */
function renderTranscriptToolEntry(
  theme: ExtensionCommandContext["ui"]["theme"],
  width: number,
  entry: SubagentTranscriptEntry,
): string[] {
  const toolCallId = entry.toolCallId ?? `${entry.toolName ?? "tool"}-${entry.createdAt}`;
  const toolName = entry.toolName ?? "tool";
  return renderSummary(toolCallId, toolName, summarizeArgs(toolName, entry.args ?? {}), theme, false).render(width);
}

/**
 * Renders one transcript entry with existing Tron renderers.
 *
 * @param theme Current UI theme.
 * @param width Available detail width.
 * @param entry Transcript entry.
 * @returns Styled detail lines.
 */
function renderTranscriptEntry(
  theme: ExtensionCommandContext["ui"]["theme"],
  width: number,
  entry: SubagentTranscriptEntry,
  connectThinkingToTools = false,
  connectThinkingFromTool = false,
): string[] {
  switch (entry.role) {
    case "user":
      return renderCompactInputBubble(entry.text, width);
    case "thinking":
      return new ThinkingLabelBlock(getThinkingPreview(entry.text), connectThinkingToTools, connectThinkingFromTool).render(width);
    case "tool":
      return renderTranscriptToolEntry(theme, width, entry);
    case "error":
      return [theme.fg("error", `Error: ${entry.text}`)];
    case "assistant":
    case "system":
      return renderMarkdownTranscript(entry.text, width);
    default:
      return toPlainTextLines(entry.text);
  }
}

/**
 * Renders the full transcript for one subagent run using shared Tron UI renderers.
 *
 * @param theme Current UI theme.
 * @param width Available detail width.
 * @param run Target run.
 * @returns Styled transcript lines.
 */
export function renderSubagentTranscriptLines(
  theme: ExtensionCommandContext["ui"]["theme"],
  width: number,
  run: SubagentRun,
): string[] {
  if (!run.transcript.length) {
    return ["No transcript available yet."];
  }
  const frameContent = run.transcript.flatMap<Array<{ type?: unknown; thinking?: unknown; id?: unknown; name?: unknown }>[number]>((entry) => {
    if (entry.role === "thinking") return [{ type: "thinking", thinking: entry.text }];
    if (entry.role === "tool") return [{ type: "toolCall", id: entry.toolCallId ?? `${entry.toolName ?? "tool"}-${entry.createdAt}`, name: entry.toolName }];
    return [];
  });
  syncToolCallFrameState(frameContent);
  return run.transcript.flatMap((entry, index) => {
    const previousEntry = run.transcript[index - 1];
    const nextEntry = run.transcript[index + 1];
    const connectThinkingToTools = entry.role === "thinking" && nextEntry?.role === "tool";
    const connectThinkingFromTool = entry.role === "thinking" && previousEntry?.role === "tool";
    const lines = nextEntry?.role === "thinking"
      ? trimTrailingTranscriptBorder(renderTranscriptEntry(theme, width, entry, connectThinkingToTools, connectThinkingFromTool))
      : renderTranscriptEntry(theme, width, entry, connectThinkingToTools, connectThinkingFromTool);
    if (index === run.transcript.length - 1) return lines;
    if (!shouldInsertTranscriptSpacer(entry, nextEntry)) return lines;
    return [...lines, ""];
  });
}
