import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { computeTwoPaneWidths } from "@nexus/tui-kit/modal/index";
import { readResumeTranscriptLines } from "./resume-transcript/readResumeTranscriptLines";
import type { SlashMenuLeaf, SlashMenuSection } from "./types";

export type ResumePreviewState = {
  renderedPreviewKey?: string;
  renderedPreviewWidth?: number;
  previewRequestId: number;
};

/**
 * Refreshes the transcript preview for the selected resume item when width changes.
 *
 * @param input Resume preview dependencies and mutable state.
 */
export function updateResumePreview(input: {
  width: number;
  ctx: ExtensionContext;
  item: SlashMenuLeaf | SlashMenuSection;
  state: ResumePreviewState;
  previewCache: Map<string, string[]>;
  isRightPaneFocused: () => boolean;
  setRightLines: (lines: string[]) => void;
  requestRender: () => void;
  isStillSelected: (item: SlashMenuLeaf | SlashMenuSection) => boolean;
  leftPaneRatio?: number;
}): void {
  const dialogWidth = Math.max(80, Math.min(input.width, Math.floor(input.width * 0.9)));
  const innerWidth = Math.max(78, dialogWidth - 2);
  const leftPaneRatio = input.leftPaneRatio ?? (input.isRightPaneFocused() ? 0.3 : 0.6);
  const { rightWidth } = computeTwoPaneWidths(innerWidth, true, leftPaneRatio);
  const previewWidth = Math.max(24, rightWidth);
  const previewKey = `resume:${input.item.value}`;
  if (input.state.renderedPreviewKey === previewKey && input.state.renderedPreviewWidth === previewWidth) return;
  input.state.renderedPreviewKey = previewKey;
  input.state.renderedPreviewWidth = previewWidth;
  const cachedLines = input.previewCache.get(`${previewKey}:${previewWidth}`);
  if (cachedLines) {
    input.setRightLines(cachedLines);
    return;
  }
  input.setRightLines(["Loading transcript..."]);
  const requestId = ++input.state.previewRequestId;
  queueMicrotask(() => {
    try {
      const lines = readResumeTranscriptLines(input.ctx.ui.theme, previewWidth, input.item.value);
      input.previewCache.set(`${previewKey}:${previewWidth}`, lines);
      if (requestId !== input.state.previewRequestId || !input.isStillSelected(input.item)) return;
      input.setRightLines(lines);
    } catch (error) {
      if (requestId !== input.state.previewRequestId || !input.isStillSelected(input.item)) return;
      input.setRightLines([`Failed to load transcript: ${error instanceof Error ? error.message : String(error)}`]);
    }
    input.requestRender();
  });
}
