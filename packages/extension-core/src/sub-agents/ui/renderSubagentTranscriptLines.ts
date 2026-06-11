import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { syncToolCallFrameState } from "../../tron/activity/syncToolCallFrameState.js";
import { renderTranscriptEntry } from "../../tron/transcript/renderTranscriptEntry.js";
import { trimTrailingTranscriptBorder } from "../../tron/transcript/trimTrailingTranscriptBorder.js";
import type { SubagentRun } from "../types.js";

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
    const { renderer } = renderTranscriptEntry(entry, {
      theme,
      connectThinkingToTools,
      connectThinkingFromTool,
    });
    const lines = nextEntry?.role === "thinking"
      ? trimTrailingTranscriptBorder(renderer.render(width))
      : renderer.render(width);
    return lines;
  });
}
