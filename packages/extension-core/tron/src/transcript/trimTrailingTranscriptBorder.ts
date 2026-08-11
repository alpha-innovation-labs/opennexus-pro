import stripAnsi from "strip-ansi";

/**
 * Removes one closing border line so the next thinking box can absorb that join.
 *
 * @param lines Rendered transcript lines.
 * @returns Lines without a trailing closing border when present.
 */
export function trimTrailingTranscriptBorder(lines: string[]): string[] {
	const lastLine = stripAnsi(lines.at(-1) ?? "").trimStart();
	if (
		(lastLine.startsWith("╰") && lastLine.endsWith("╯")) ||
		(lastLine.startsWith("└") && lastLine.endsWith("┘"))
	) {
		return lines.slice(0, -1);
	}
	return lines;
}
