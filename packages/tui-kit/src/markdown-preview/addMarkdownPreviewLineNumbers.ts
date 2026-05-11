import { padMarkdownPreviewLine } from "./padMarkdownPreviewLine.js";
import { styleMarkdownPreviewSegment } from "./styleMarkdownPreviewSegment.js";
import type { MarkdownPreviewRow, MarkdownPreviewTheme } from "./types.js";

/** Adds a source-line gutter to rendered markdown preview rows. */
export function addMarkdownPreviewLineNumbers(rows: MarkdownPreviewRow[], totalWidth: number, sourceLineCount: number, theme?: MarkdownPreviewTheme): string[] {
  const digitWidth = Math.max(2, String(Math.max(1, sourceLineCount)).length);
  const contentWidth = Math.max(1, totalWidth - digitWidth - 3);
  return rows.map((row) => {
    const numberText = row.sourceLine === undefined ? " ".repeat(digitWidth) : String(row.sourceLine).padStart(digitWidth, " ");
    const number = styleMarkdownPreviewSegment(theme, "lineNumber", numberText);
    const separator = styleMarkdownPreviewSegment(theme, "lineNumberSeparator", " │ ");
    return `${number}${separator}${padMarkdownPreviewLine(row.line, contentWidth)}`;
  });
}

/** Renders an empty markdown preview row that preserves the line-number gutter. */
export function renderMarkdownPreviewLineNumberFiller(totalWidth: number, sourceLineCount: number, theme?: MarkdownPreviewTheme): string {
  const digitWidth = Math.max(2, String(Math.max(1, sourceLineCount)).length);
  const contentWidth = Math.max(1, totalWidth - digitWidth - 3);
  const number = styleMarkdownPreviewSegment(theme, "lineNumber", " ".repeat(digitWidth));
  const separator = styleMarkdownPreviewSegment(theme, "lineNumberSeparator", " │ ");
  return `${number}${separator}${padMarkdownPreviewLine("", contentWidth)}`;
}

/** Returns the markdown preview content width after reserving the line-number gutter. */
export function getMarkdownPreviewNumberedContentWidth(sourceLineCount: number, totalWidth: number): number {
  const digitWidth = Math.max(2, String(Math.max(1, sourceLineCount)).length);
  return Math.max(1, totalWidth - digitWidth - 3);
}
