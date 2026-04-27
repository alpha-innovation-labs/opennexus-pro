import type { MarkdownFileSnapshot } from "../file/computeMarkdownFileSnapshot.js";

/**
 * Builds the instruction and file context for the selected Markdown line chat.
 */
export function createLineChatContext(snapshot: MarkdownFileSnapshot, lineNumber: number): string {
	const lineText = snapshot.lines[lineNumber - 1] ?? "";
	return [
		"The user is asking about one specific line in this Markdown file.",
		`File: ${snapshot.filePath}`,
		`Selected line: ${lineNumber}`,
		`Selected line text: ${lineText}`,
		"Full file content:",
		snapshot.content,
	].join("\n");
}
