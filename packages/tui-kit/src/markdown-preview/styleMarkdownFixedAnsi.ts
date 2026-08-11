import type { MarkdownPreviewStyleToken } from "./types";

const reset = "\x1b[0m";
const lineNumber = "\x1b[38;2;75;86;112m";
const lineSeparator = "\x1b[38;2;65;75;95m";
const inlineCode = "\x1b[48;2;15;18;22m\x1b[38;2;240;113;120m";
const orange = "\x1b[38;2;255;180;84m";

/** Applies fixed ANSI styling required for markdown preview parity. */
export function styleMarkdownFixedAnsi(
	token: MarkdownPreviewStyleToken,
	value: string,
): string {
	if (token === "lineNumber") return `${lineNumber}${value}${reset}`;
	if (token === "lineNumberSeparator")
		return `${lineSeparator}${value}${reset}`;
	if (token === "inlineCode") return `${inlineCode}${value}${reset}`;
	if (token === "list.marker") return `${orange}${value}${reset}`;
	return value;
}
