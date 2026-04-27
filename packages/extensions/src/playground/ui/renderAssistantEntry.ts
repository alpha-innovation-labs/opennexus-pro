import { getMarkdownTheme } from "@mariozechner/pi-coding-agent";
import { Markdown } from "@mariozechner/pi-tui";

/**
 * Renders one assistant transcript entry with normal chat markdown styling.
 *
 * @param text Assistant message text.
 * @param width Available content width.
 * @returns Rendered assistant lines.
 */
export function renderAssistantEntry(text: string, width: number): string[] {
	return new Markdown(text, 0, 0, getMarkdownTheme()).render(width);
}
