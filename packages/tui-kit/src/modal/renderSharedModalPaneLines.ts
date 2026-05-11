import { renderMarkdownPreviewLineNumberFiller } from "../markdown-preview/addMarkdownPreviewLineNumbers.js";
import { renderMarkdownPreview } from "../markdown-preview/renderMarkdownPreview.js";
import type { MarkdownPreviewStyleToken } from "../markdown-preview/types.js";
import type { SharedModalPane, SharedModalTheme } from "./types.js";

/** Renders pane content according to its declared content type. */
export function renderSharedModalPaneLines(theme: SharedModalTheme, pane: SharedModalPane, width: number): string[] {
  if (pane.contentType !== "markdown") return pane.lines;
  return renderMarkdownPreview({ markdown: pane.lines.join("\n"), theme: { style: (token, value) => styleMarkdownPaneToken(theme, token, value) }, width });
}

/** Renders a filler row for a pane while preserving pane-specific chrome. */
export function renderSharedModalPaneFillerLine(theme: SharedModalTheme, pane: SharedModalPane, width: number): string {
  if (pane.contentType !== "markdown") return "";
  return renderMarkdownPreviewLineNumberFiller(width, pane.lines.join("\n").split("\n").length, { style: (token, value) => styleMarkdownPaneToken(theme, token, value) });
}

/** Maps markdown preview style tokens onto the shared modal theme. */
function styleMarkdownPaneToken(theme: SharedModalTheme, token: MarkdownPreviewStyleToken, value: string): string {
  if (token.startsWith("heading.")) return theme.fg("syntaxType", value);
  if (token === "strong" || token === "codeBlock.icon") return theme.fg("syntaxFunction", value);
  if (token === "emphasis" || token === "blockquote.marker") return theme.fg("accent", value);
  if (token === "inlineCode" || token === "codeBlock.header") return theme.fg("syntaxString", value);
  if (token === "link" || token === "checkbox.checked" || token === "list.marker") return theme.fg("syntaxType", value);
  if (token === "strikethrough" || token === "horizontalRule" || token === "codeBlock.lineNumber") return theme.fg("dim", value);
  if (token === "checkbox.todo") return theme.fg("warning", value);
  if (token === "checkbox.unchecked" || token === "codeBlock.border") return theme.fg("borderMuted", value);
  return value;
}
