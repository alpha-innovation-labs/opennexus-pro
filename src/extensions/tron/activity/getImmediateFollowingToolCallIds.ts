type ToolCallContent = { type?: unknown; id?: unknown; text?: unknown; thinking?: unknown };

/**
 * Returns the contiguous tool-call ids that immediately follow a thinking block.
 *
 * @param content Assistant message content blocks.
 * @param index Thinking block index.
 * @returns Tool call ids directly attached to that thinking block.
 */
export function getImmediateFollowingToolCallIds(content: ToolCallContent[], index: number): string[] {
	const toolCallIds: string[] = [];

	for (let nextIndex = index + 1; nextIndex < content.length; nextIndex++) {
		const next = content[nextIndex];
		if (!next) continue;
		if (next.type === "toolCall") {
			if (typeof next.id === "string" && next.id) {
				toolCallIds.push(next.id);
			}
			continue;
		}
		if (next.type === "text" && typeof next.text === "string" && next.text.trim()) return [];
		if (next.type === "thinking" && typeof next.thinking === "string" && next.thinking.trim()) return [];
		if (toolCallIds.length > 0) return toolCallIds;
	}

	return toolCallIds;
}
