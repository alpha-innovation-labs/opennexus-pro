import { HORIZONTAL_RULE_CHAR } from "../constants.js";
import { styleMarkdownPreviewSegment } from "../styleMarkdownPreviewSegment.js";
import { wrapMarkdownPreviewLines } from "../wrapMarkdownPreviewLines.js";
import type { MarkdownPreviewRow, MarkdownPreviewTheme } from "../types.js";

/** Renders YAML frontmatter with Ratkit/lazy-skills style markers. */
export function renderFrontmatter(lines: string[], startSourceLine: number, width: number, theme?: MarkdownPreviewTheme): MarkdownPreviewRow[] {
  const rows: MarkdownPreviewRow[] = [];
  const marker = styleMarkdownPreviewSegment(theme, "frontmatter.marker", "▶");
  const label = styleMarkdownPreviewSegment(theme, "frontmatter.key", " frontmatter ");
  const ruleWidth = Math.max(1, width - 2 - label.length);
  rows.push({ sourceLine: startSourceLine, line: `${marker} ${HORIZONTAL_RULE_CHAR.repeat(Math.max(1, Math.floor(ruleWidth / 2)))}${label}${HORIZONTAL_RULE_CHAR.repeat(Math.max(1, Math.ceil(ruleWidth / 2)))}` });

  for (let index = 1; index < lines.length - 1; index += 1) {
    const sourceLine = startSourceLine + index;
    const line = lines[index] ?? "";
    const split = /^(.*?):\s*(.*)$/u.exec(line);
    const rendered = split === null ? line : `${styleMarkdownPreviewSegment(theme, "frontmatter.key", `${split[1]}: `)}${styleMarkdownPreviewSegment(theme, "frontmatter.value", split[2] ?? "")}`;
    const wrapped = wrapMarkdownPreviewLines(rendered, width);
    rows.push(...wrapped.map((part, partIndex) => ({ sourceLine: partIndex === 0 ? sourceLine : undefined, line: part })));
  }

  rows.push({ sourceLine: startSourceLine + lines.length - 1, line: styleMarkdownPreviewSegment(theme, "frontmatter.border", HORIZONTAL_RULE_CHAR.repeat(width)) });
  return rows;
}
