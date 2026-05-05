/**
 * Extracts visible text from a Pi message content payload.
 *
 * @param content Message content payload.
 * @returns Concatenated visible text.
 */
export function extractContentText(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content
		.map((part) => {
			if (!part || typeof part !== "object") return "";
			const block = part as { text?: unknown; content?: unknown };
			if (typeof block.text === "string") return block.text;
			if (typeof block.content === "string") return block.content;
			return "";
		})
		.filter(Boolean)
		.join("\n");
}
