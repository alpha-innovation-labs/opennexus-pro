import { parseInlineSegments } from "../inline/parseInlineSegments.js";
import { renderInlineSegments } from "../inline/renderInlineSegments.js";
import type { MarkdownPreviewTheme } from "../types.js";

/** Renders a markdown paragraph with Ratkit-style inline segments. */
export function renderParagraph(markdown: string, theme?: MarkdownPreviewTheme): string {
  return renderInlineSegments(parseInlineSegments(markdown), theme);
}
