import type { MarkdownFileSnapshot } from "../file/computeMarkdownFileSnapshot.js";

/**
 * Builds the real LLM prompt for a selected Markdown line chat turn.
 */
export function createLineChatPrompt(snapshot: MarkdownFileSnapshot, lineNumber: number, userMessage: string): string {
	const selectedLineText = snapshot.lines[lineNumber - 1] ?? "";
	return [
		"You are the right-panel md-editor chat inside Nexus.",
		"The user is asking about one specific line in the Markdown file below.",
		"You may use tools when useful. If the user asks to edit, update the file with the edit tool.",
		`File: ${snapshot.filePath}`,
		`Selected line number: ${lineNumber}`,
		`Selected line text: ${selectedLineText}`,
		"Full file content:",
		snapshot.content,
		"User request:",
		userMessage,
	].join("\n");
}
