type AssistantToolCallBlock = { type?: unknown; id?: unknown };

/**
 * Collects tool-call ids from one assistant message.
 *
 * @param message Assistant message payload.
 * @returns Tool-call ids in content order.
 */
export function getAssistantMessageToolCallIds(message: {
	content?: AssistantToolCallBlock[];
}): string[] {
	return (message.content ?? [])
		.filter(
			(content): content is { type: "toolCall"; id: string } =>
				content?.type === "toolCall" &&
				typeof content.id === "string" &&
				content.id.length > 0,
		)
		.map((content) => content.id);
}
