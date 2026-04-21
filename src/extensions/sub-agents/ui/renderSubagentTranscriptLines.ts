import { getMarkdownTheme } from "@mariozechner/pi-coding-agent";
import { Markdown } from "@mariozechner/pi-tui";
import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
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
): string[] {
  switch (entry.role) {
    case "user":
      return renderCompactInputBubble(entry.text, width);
    case "thinking":
      return new ThinkingLabelBlock(getThinkingPreview(entry.text), false).render(width);
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
  return run.transcript.flatMap((entry, index) => {
    const lines = renderTranscriptEntry(theme, width, entry);
    if (index === run.transcript.length - 1) return lines;
    return [...lines, ""];
  });
}
