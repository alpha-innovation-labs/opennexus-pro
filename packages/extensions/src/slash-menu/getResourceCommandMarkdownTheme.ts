import { getMarkdownTheme } from "@mariozechner/pi-coding-agent";
import type { MarkdownTheme } from "@mariozechner/pi-tui";

const plainTheme: MarkdownTheme = {
  heading: (text) => text,
  link: (text) => text,
  linkUrl: (text) => text,
  code: (text) => text,
  codeBlock: (text) => text,
  codeBlockBorder: (text) => text,
  quote: (text) => text,
  quoteBorder: (text) => text,
  hr: (text) => text,
  listBullet: (text) => text,
  bold: (text) => text,
  italic: (text) => text,
  strikethrough: (text) => text,
  underline: (text) => text,
};

/**
 * Resolves the Tron/shared markdown theme, with a plain fallback for isolated tests.
 *
 * @returns Markdown theme.
 */
export function getResourceCommandMarkdownTheme(): MarkdownTheme {
  try {
    return getMarkdownTheme();
  } catch {
    return plainTheme;
  }
}

/**
 * Returns a plain markdown theme for non-interactive tests.
 *
 * @returns Plain markdown theme.
 */
export function getPlainResourceCommandMarkdownTheme(): MarkdownTheme {
  return plainTheme;
}
