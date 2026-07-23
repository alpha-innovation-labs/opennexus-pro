import type { MarkdownFileSnapshot } from "../file/computeMarkdownFileSnapshot.js";

/**
 * Builds the per-line md-editor system prompt for the real hidden AgentSession.
 */
export function createLineChatSystemPrompt(snapshot: MarkdownFileSnapshot, lineNumber: number): string {
	const selectedLineText = snapshot.lines[lineNumber - 1] ?? "";
	return [
		"You are the right-panel md-editor chat inside Nexus.",
		"The user is asking about one specific line in the Markdown file below.",
		"Use tools when needed. If the user asks to change the file, update it with the edit tool.",
		`File: ${snapshot.filePath}`,
		`Selected line number: ${lineNumber}`,
		`Selected line text: ${selectedLineText}`,
		"Full file content:",
		snapshot.content,
	].join("\n");
}
