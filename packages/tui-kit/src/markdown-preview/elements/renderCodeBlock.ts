import { visibleWidth } from "@mariozechner/pi-tui";
import { getLanguageIcon } from "../constants.js";
import { padMarkdownPreviewLine } from "../padMarkdownPreviewLine.js";
import { styleMarkdownPreviewSegment } from "../styleMarkdownPreviewSegment.js";
import type { MarkdownCodeBlock, MarkdownPreviewTheme } from "../types.js";

/** Renders a Ratkit-style fenced code block with header and borders. */
export function renderCodeBlock(block: MarkdownCodeBlock, width: number, theme?: MarkdownPreviewTheme): string[] {
  return [renderCodeBlockHeader(block.language, width, theme), ...block.lines.map((line) => renderCodeBlockLine(line, width, theme)), renderCodeBlockBottom(width, theme)];
}

/** Renders the code block header with a language icon. */
function renderCodeBlockHeader(language: string, width: number, theme?: MarkdownPreviewTheme): string {
  const displayLanguage = language.trim() === "" ? "text" : language.trim();
  const icon = styleMarkdownPreviewSegment(theme, "codeBlock.icon", getLanguageIcon(displayLanguage));
  const label = styleMarkdownPreviewSegment(theme, "codeBlock.header", `${icon} ${displayLanguage} `);
  const start = `╭─ ${label}`;
  const dashes = "─".repeat(Math.max(0, width - visibleWidth(start) - 1));
  return styleMarkdownPreviewSegment(theme, "codeBlock.border", `${start}${dashes}╮`);
}

/** Renders one code block content line. */
function renderCodeBlockLine(content: string, width: number, theme?: MarkdownPreviewTheme): string {
  const prefix = "│ ";
  const suffix = " │";
  const innerWidth = Math.max(0, width - visibleWidth(prefix) - visibleWidth(suffix));
  const body = styleMarkdownPreviewSegment(theme, "codeBlock.background", padMarkdownPreviewLine(content, innerWidth));
  return styleMarkdownPreviewSegment(theme, "codeBlock.border", `${prefix}${body}${suffix}`);
}

/** Renders the code block bottom border. */
function renderCodeBlockBottom(width: number, theme?: MarkdownPreviewTheme): string {
  return styleMarkdownPreviewSegment(theme, "codeBlock.border", `╰${"─".repeat(Math.max(0, width - 2))}╯`);
}
