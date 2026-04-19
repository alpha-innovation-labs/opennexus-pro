/**
 * Builds the stable activity key for a tool call.
 *
 * @param toolCallId Tool call identifier.
 * @returns Stable activity key.
 */
export function toolActivityKey(toolCallId: string): string {
	return `tool:${toolCallId}`;
}
