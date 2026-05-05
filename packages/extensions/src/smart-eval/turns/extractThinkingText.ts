/**
 * Extracts hidden thinking text from assistant content.
 *
 * @param content Assistant content payload.
 * @returns Concatenated thinking text.
 */
export function extractThinkingText(content: unknown): string {
	if (!Array.isArray(content)) return "";
	return content
		.map((part) => {
			if (!part || typeof part !== "object") return "";
			const block = part as { thinking?: unknown };
			return typeof block.thinking === "string" ? block.thinking : "";
		})
		.filter(Boolean)
		.join("\n");
}
