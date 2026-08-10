import { Markdown } from "@earendil-works/pi-tui";
import { getPlainResourceCommandMarkdownTheme, getResourceCommandMarkdownTheme } from "./getResourceCommandMarkdownTheme";

/**
 * Renders resource command markdown using the same markdown component as Tron transcript previews.
 *
 * @param markdown Markdown content.
 * @param width Available preview width.
 * @returns Rendered terminal lines.
 */
export function renderResourceCommandMarkdown(markdown: string, width: number): string[] {
  try {
    return new Markdown(markdown, 0, 0, getResourceCommandMarkdownTheme()).render(width);
  } catch {
    return new Markdown(markdown, 0, 0, getPlainResourceCommandMarkdownTheme()).render(width);
  }
}
