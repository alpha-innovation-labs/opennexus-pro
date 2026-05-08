import { HORIZONTAL_RULE_CHAR } from "../constants.js";
import { styleMarkdownPreviewSegment } from "../styleMarkdownPreviewSegment.js";
import type { MarkdownPreviewTheme } from "../types.js";

/** Renders a Ratkit-style full-width horizontal rule. */
export function renderHorizontalRule(width: number, theme?: MarkdownPreviewTheme): string {
  return styleMarkdownPreviewSegment(theme, "horizontalRule", HORIZONTAL_RULE_CHAR.repeat(Math.max(0, width)));
}
