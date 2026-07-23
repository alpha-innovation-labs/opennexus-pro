import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { renderMarkdownDiffTokens } from "./renderMarkdownDiffTokens.js";
import { trackMarkdownDiff } from "./trackMarkdownDiff.js";

/**
 * Renders one modified line with word-level insertions and removals inside the same row.
 */
export function renderInlineMarkdownDiffLine(previousLine: string, nextLine: string, theme: ExtensionCommandContext["ui"]["theme"]): string {
	return renderMarkdownDiffTokens(trackMarkdownDiff(previousLine, nextLine), theme);
}
