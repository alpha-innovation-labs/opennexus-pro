type ForkSessionEntry = {
	type?: string;
	message?: {
		role?: string;
		content?: unknown;
	};
};

/**
 * Extracts the prompt text that should be restored after forking from a user message.
 *
 * @param entry Session entry selected for forking.
 * @returns Text content to restore into the editor.
 */
export function extractForkSelectedText(
	entry: ForkSessionEntry | undefined,
): string {
	if (entry?.type !== "message" || entry.message?.role !== "user") return "";
	const content = entry.message.content;
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content
		.filter(
			(part): part is { type: "text"; text: string } =>
				typeof part === "object" &&
				part !== null &&
				"type" in part &&
				part.type === "text" &&
				"text" in part &&
				typeof part.text === "string",
		)
		.map((part) => part.text)
		.join("");
}
