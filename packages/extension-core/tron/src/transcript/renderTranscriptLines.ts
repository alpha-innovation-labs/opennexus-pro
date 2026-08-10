import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { syncToolCallFrameState } from "../syncToolCallFrameState.ts";
import { renderTranscriptEntry } from "./renderTranscriptEntry.js";
import { trimTrailingTranscriptBorder } from "./trimTrailingTranscriptBorder.js";
import type { TranscriptEntry } from "./types.js";

/**
 * Content-block shape used by `syncToolCallFrameState` to track tool-call frame borders.
 */
type FrameContent = { type?: string; thinking?: string; id?: string; name?: string };

/**
 * Minimal transcript object accepted by `renderTranscriptLines`.
 * Accepts any object with a `transcript` array of `TranscriptEntry`-compatible items.
 */
export interface TranscriptRun {
  transcript: TranscriptEntry[];
}

/**
 * Renders the full transcript for one run using shared Tron UI renderers.
 *
 * This is the shared rendering path used by subagent history, the resume
 * transcript preview, and the md-editor line chat — all consumers that
 need
 * a static transcript-as-strings view.
 *
 * @param theme Current UI theme.
 * @param width Available detail width.
 * @param run Target run with a transcript array.
 * @returns Styled transcript lines.
 */
export function renderTranscriptLines(
  theme: ExtensionCommandContext["ui"]["theme"],
  width: number,
  run: TranscriptRun,
): string[] {
  if (!run.transcript || run.transcript.length === 0) {
    return ["No transcript available yet."];
  }

  const frameContent: FrameContent[] = run.transcript.flatMap((entry) => {
    if (entry.role === "thinking") return [{ type: "thinking", thinking: entry.text }] as FrameContent[];
    if (entry.role === "tool") {
      return [{ type: "toolCall", id: entry.toolCallId ?? `${entry.toolName ?? "tool"}-${entry.createdAt}`, name: entry.toolName }] as FrameContent[];
    }
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
