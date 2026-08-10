import stripAnsi from "strip-ansi";
import { visibleWidth } from "@earendil-works/pi-tui";
import { addMarkdownPreviewLineNumbers, getMarkdownPreviewNumberedContentWidth } from "./addMarkdownPreviewLineNumbers";
import { BULLET_MARKERS, CHECKBOX_CHECKED, CHECKBOX_TODO, CHECKBOX_UNCHECKED } from "./constants";
import { renderBlockquote } from "./elements/renderBlockquote";
import { renderCodeBlock } from "./elements/renderCodeBlock";
import { renderFrontmatter } from "./elements/renderFrontmatter";
import { renderHeading } from "./elements/renderHeading";
import { renderHorizontalRule } from "./elements/renderHorizontalRule";
import { renderListItem } from "./elements/renderListItem";
import { renderParagraph } from "./elements/renderParagraph";
import type { MarkdownCodeBlock, MarkdownPreviewOptions, MarkdownPreviewRow } from "./types";
import { wrapMarkdownPreviewLines } from "./wrapMarkdownPreviewLines";
import { styleMarkdownPreviewSegment } from "./styleMarkdownPreviewSegment";

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
  const listRows = renderMarkdownPreviewListSourceLine(line, sourceLine, width, options.theme);
  if (listRows !== undefined) return listRows;
  const renderedLine = renderMarkdownPreviewLine(line, width, options.theme);
  if (renderedLine === undefined) return [{ sourceLine, line: "" }];
  const wrapped = wrapMarkdownPreviewLines(renderedLine, width);
  return wrapped.map((part, index) => ({ sourceLine: index === 0 ? sourceLine : undefined, line: part }));
}

/** Renders and wraps one list source line with a hanging indent. */
function renderMarkdownPreviewListSourceLine(line: string, sourceLine: number, width: number, theme: MarkdownPreviewOptions["theme"]): MarkdownPreviewRow[] | undefined {
  const list = /^(\s*)(?:(\d+)\.\s+|[-*+]\s+)(.*)$/u.exec(line);
  if (list === null) return undefined;
  const depth = Math.floor((list[1]?.length ?? 0) / 2);
  const orderedNumber = list[2] === undefined ? undefined : Number(list[2]);
  const task = /^(\[([ xX-])\]\s+)(.*)$/u.exec(list[3] ?? "");
  const body = task === null ? list[3] ?? "" : task[3] ?? "";
  const checkbox = task === null ? "" : renderCheckbox(task[2] ?? " ", theme);
  const marker = orderedNumber === undefined ? BULLET_MARKERS[depth % BULLET_MARKERS.length] : `${orderedNumber}. `;
  const prefix = ` ${"  ".repeat(depth)}${styleMarkdownPreviewSegment(theme, "list.marker", marker)}${checkbox}`;
  const prefixWidth = visibleWidth(stripAnsi(prefix));
  const bodyWidth = Math.max(1, width - prefixWidth);
  const bodyRows = wrapMarkdownPreviewLines(renderParagraph(body, theme), bodyWidth);
  return bodyRows.map((bodyRow, index) => ({ sourceLine: index === 0 ? sourceLine : undefined, line: `${index === 0 ? prefix : " ".repeat(prefixWidth)}${bodyRow}` }));
}

/** Renders a task-list checkbox marker. */
function renderCheckbox(state: string, theme: MarkdownPreviewOptions["theme"]): string {
  if (state === "x" || state === "X") return styleMarkdownPreviewSegment(theme, "checkbox.checked", CHECKBOX_CHECKED);
  if (state === "-") return styleMarkdownPreviewSegment(theme, "checkbox.todo", CHECKBOX_TODO);
  return styleMarkdownPreviewSegment(theme, "checkbox.unchecked", CHECKBOX_UNCHECKED);
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
