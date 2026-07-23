import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { renderMarkdownDiffTokens } from "./renderMarkdownDiffTokens.js";
import { trackMarkdownDiff } from "./trackMarkdownDiff.js";

/**
 * Renders a pending diff as line-shaped strings for the read-only Markdown pane.
 */
export function renderMarkdownDiffLines(previous: string, next: string, theme: ExtensionCommandContext["ui"]["theme"]): string[] {
	return renderMarkdownDiffTokens(trackMarkdownDiff(previous, next), theme).split(/\r?\n/);
}
