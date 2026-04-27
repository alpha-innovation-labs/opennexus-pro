import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { MarkdownDiffToken } from "./trackMarkdownDiff.js";

/**
 * Renders diff tokens using green additions and red strikethrough removals.
 */
export function renderMarkdownDiffTokens(tokens: MarkdownDiffToken[], theme: ExtensionCommandContext["ui"]["theme"]): string {
	return tokens.map((token) => {
		if (token.kind === "added") return theme.fg("success", token.text);
		if (token.kind === "removed") return theme.fg("error", `\x1b[9m${token.text}\x1b[29m`);
		return token.text;
	}).join("");
}
