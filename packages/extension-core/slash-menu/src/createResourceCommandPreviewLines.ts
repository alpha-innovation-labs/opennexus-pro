import type { SharedModalTheme } from "@nexus/tui-kit/modal/index";
import { renderMarkdownPreview, type MarkdownPreviewStyleToken } from "@nexus/tui-kit/markdown-preview/index";
import { createResourceCommandMarkdown } from "./createResourceCommandMarkdown";
import type { SlashMenuLeaf, SlashMenuSection } from "./types";

const RESOURCE_COMMAND_PREVIEW_WIDTH = 58;

/**
 * Creates rendered markdown preview lines for a resource command.
 *
 * @param item Resource command item.
 * @param theme Active UI theme.
 * @returns Rendered markdown preview lines.
 */
export function createResourceCommandPreviewLines(item: SlashMenuLeaf | SlashMenuSection, theme: SharedModalTheme): string[] {
  return renderMarkdownPreview({ markdown: createResourceCommandMarkdown(item), width: RESOURCE_COMMAND_PREVIEW_WIDTH, theme: { style: (token, value) => styleResourceMarkdownToken(theme, token, value) } });
}

/** Maps markdown preview tokens to Nexus theme colors for resource previews. */
function styleResourceMarkdownToken(theme: SharedModalTheme, token: MarkdownPreviewStyleToken, value: string): string {
  if (token === "lineNumber" || token === "lineNumberSeparator" || token === "inlineCode") return value;
  if (token === "frontmatter.key" || token === "strikethrough") return theme.fg("error", value);
  if (token === "list.marker") return value;
  if (token === "frontmatter.value" || token === "link") return theme.fg("syntaxType", value);
  if (token === "frontmatter.marker") return theme.fg("warning", value);
  if (token === "frontmatter.border" || token === "horizontalRule") return theme.fg("muted", value);
  if (token === "strong") return theme.fg("text", value);
  return value;
}
