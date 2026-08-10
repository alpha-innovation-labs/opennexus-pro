import { parseInlineSegments } from "../inline/parseInlineSegments";
import { renderInlineSegments } from "../inline/renderInlineSegments";
import type { MarkdownPreviewTheme } from "../types";

/** Renders a markdown paragraph with Ratkit-style inline segments. */
export function renderParagraph(markdown: string, theme?: MarkdownPreviewTheme): string {
  return renderInlineSegments(parseInlineSegments(markdown), theme);
}
