/**
 * Extracts concatenated assistant thinking text from message content blocks.
 *
 * @param content Assistant message content.
 * @returns Combined thinking text.
 */
export function getThinkingText(content: unknown): string {
	if (!Array.isArray(content)) return "";
	return content
		.filter(
			(block): block is { type: "thinking"; thinking: string } =>
				!!block &&
				typeof block === "object" &&
				(block as { type?: unknown }).type === "thinking" &&
				typeof (block as { thinking?: unknown }).thinking === "string",
		)
		.map((block) => block.thinking.trim())
		.filter(Boolean)
		.join("\n\n")
		.trim();
}
