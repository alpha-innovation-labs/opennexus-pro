import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

/**
 * Applies lightweight Markdown emphasis for the line-numbered editor view.
 */
export function renderMarkdownLine(line: string, theme: ExtensionCommandContext["ui"]["theme"]): string {
	if (line.startsWith("#")) return theme.bold(theme.fg("mdHeading", line));
	if (/^\s*[-*+]\s/.test(line)) return theme.fg("mdListBullet", line);
	if (line.trim().startsWith(">")) return theme.fg("mdQuote", line);
	if (line.trim().startsWith("```")) return theme.fg("mdCodeBlock", line);
	return line.replace(/`([^`]+)`/g, (_match, code: string) => theme.fg("mdCode", code));
}
