import { addMarkdownPreviewLineNumbers, getMarkdownPreviewNumberedContentWidth } from "./addMarkdownPreviewLineNumbers.js";
import { renderBlockquote } from "./elements/renderBlockquote.js";
import { renderCodeBlock } from "./elements/renderCodeBlock.js";
import { renderFrontmatter } from "./elements/renderFrontmatter.js";
import { renderHeading } from "./elements/renderHeading.js";
import { renderHorizontalRule } from "./elements/renderHorizontalRule.js";
import { renderListItem } from "./elements/renderListItem.js";
import { renderParagraph } from "./elements/renderParagraph.js";
import type { MarkdownCodeBlock, MarkdownPreviewOptions, MarkdownPreviewRow } from "./types.js";
import { wrapMarkdownPreviewLines } from "./wrapMarkdownPreviewLines.js";
import { visibleWidth } from "@mariozechner/pi-tui";

/** Renders markdown into Ratkit/lazy-skills inspired terminal preview lines. */
export function renderMarkdownPreview(options: MarkdownPreviewOptions): string[] {
  const width = Math.max(1, Math.floor(options.width));
  const sourceLines = options.markdown.replace(/\r\n/gu, "\n").split("\n");
  const contentWidth = getMarkdownPreviewNumberedContentWidth(sourceLines.length, width);
  const rows: MarkdownPreviewRow[] = [];

  for (let index = 0; index < sourceLines.length; index += 1) {
    const frontmatter = index === 0 ? readFrontmatter(sourceLines) : undefined;
    if (frontmatter !== undefined) {
      rows.push(...renderFrontmatter(frontmatter.lines, 1, contentWidth, options.theme));
      index = frontmatter.endIndex;
      continue;
    }

    const codeBlock = readCodeBlock(sourceLines, index);
    if (codeBlock !== undefined) {
      rows.push(...renderCodeBlock(codeBlock.block, contentWidth, options.theme).map((line, offset) => ({ sourceLine: index + 1 + offset, line })));
      index = codeBlock.endIndex;
      continue;
    }

    rows.push(...renderMarkdownPreviewSourceLine(sourceLines[index] ?? "", index + 1, contentWidth, options));
  }

  return addMarkdownPreviewLineNumbers(rows, width, sourceLines.length, options.theme);
}

/** Renders one source markdown line and keeps source-line numbering on wrapped continuations. */
function renderMarkdownPreviewSourceLine(line: string, sourceLine: number, width: number, options: MarkdownPreviewOptions): MarkdownPreviewRow[] {
  if (line.trim() === "") return [{ sourceLine, line: "" }];
  const renderedLine = renderMarkdownPreviewLine(line, width, options.theme);
  if (renderedLine === undefined) return [{ sourceLine, line: "" }];
  const wrapped = wrapMarkdownPreviewLines(renderedLine, width);
  const continuationIndent = getContinuationIndent(line, renderedLine);
  return wrapped.map((part, index) => ({ sourceLine: index === 0 ? sourceLine : undefined, line: index === 0 ? part : `${continuationIndent}${part}` }));
}

/** Returns hanging indent for wrapped list continuations. */
function getContinuationIndent(sourceLine: string, renderedLine: string): string {
  const list = /^(\s*)(?:(\d+)\.\s+|[-*+]\s+)(?:\[[ xX-]\]\s+)?/u.exec(sourceLine);
  if (list === null) return "";
  const markerEnd = renderedLine.search(/\S(?!.*[●○◆◇]|.*\d\.\s)/u);
  const width = markerEnd > 0 ? markerEnd : Math.min(visibleWidth(renderedLine), (list[1]?.length ?? 0) + 3);
  return " ".repeat(Math.max(0, width));
}

/** Renders one non-fenced markdown line. */
function renderMarkdownPreviewLine(line: string, width: number, theme: MarkdownPreviewOptions["theme"]): string | undefined {
  const heading = /^(#{1,6})\s+(.*)$/u.exec(line);
  if (heading !== null) return renderHeading(heading[1]?.length ?? 1, heading[2] ?? "", width, theme);
  if (/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/u.test(line)) return renderHorizontalRule(width, theme);
  const quote = /^(>+)\s?(.*)$/u.exec(line);
  if (quote !== null) return renderBlockquote(quote[1]?.length ?? 1, quote[2] ?? "", theme);
  const list = /^(\s*)(?:(\d+)\.\s+|[-*+]\s+)(.*)$/u.exec(line);
  if (list !== null) return renderListItem(Math.floor((list[1]?.length ?? 0) / 2), list[2] === undefined ? undefined : Number(list[2]), list[3] ?? "", theme);
  return renderParagraph(line, theme);
}

/** Reads YAML frontmatter from the top of a markdown document. */
function readFrontmatter(lines: string[]): { lines: string[]; endIndex: number } | undefined {
  if ((lines[0] ?? "").trim() !== "---") return undefined;
  for (let index = 1; index < lines.length; index += 1) {
    if ((lines[index] ?? "").trim() === "---") return { lines: lines.slice(0, index + 1), endIndex: index };
  }
  return undefined;
}

/** Reads a fenced code block starting at the supplied line index. */
function readCodeBlock(lines: string[], startIndex: number): { block: MarkdownCodeBlock; endIndex: number } | undefined {
  const opener = /^```\s*([^`]*)\s*$/u.exec(lines[startIndex] ?? "");
  if (opener === null) return undefined;
  const blockLines: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (/^```\s*$/u.test(lines[index] ?? "")) return { block: { language: opener[1] ?? "", lines: blockLines }, endIndex: index };
    blockLines.push(lines[index] ?? "");
  }
  return { block: { language: opener[1] ?? "", lines: blockLines }, endIndex: lines.length - 1 };
}
