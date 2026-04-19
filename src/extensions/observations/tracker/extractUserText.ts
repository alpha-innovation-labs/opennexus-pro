/**
 * Extracts plain text from a user message payload.
 *
 * @param message Agent message.
 * @returns Concatenated user text.
 */
export function extractUserText(message: { content?: string | Array<{ type?: string; text?: string }> }): string {
	if (typeof message.content === "string") return message.content.trim();
	return (message.content ?? [])
		.filter((part) => part.type === "text" && typeof part.text === "string")
		.map((part) => part.text)
		.join("\n\n")
		.trim();
}
