import { styleMarkdownFixedAnsi } from "./styleMarkdownFixedAnsi.js";
import { styleMarkdownHeadingBackground } from "./styleMarkdownHeadingBackground.js";
import type { MarkdownPreviewStyleToken, MarkdownPreviewTheme } from "./types.js";

/** Applies a semantic markdown preview style when a theme is available. */
export function styleMarkdownPreviewSegment(theme: MarkdownPreviewTheme | undefined, token: MarkdownPreviewStyleToken, value: string): string {
  const styled = theme?.style(token, value) ?? value;
  return styleMarkdownFixedAnsi(token, styleMarkdownHeadingBackground(token, styled));
}
