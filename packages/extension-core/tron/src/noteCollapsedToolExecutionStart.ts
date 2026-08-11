/**
 * Standalone tool mode does not collect collapsed-group timing state.
 *
 * @param toolCallId Tool call id.
 * @param toolName Tool name.
 * @param args Tool arguments.
 * @param startedAt Start timestamp in milliseconds.
 */
export function noteCollapsedToolExecutionStart(
	toolCallId: string,
	toolName: string,
	args: Record<string, unknown>,
	startedAt = Date.now(),
): void {
	void toolCallId;
	void toolName;
	void args;
	void startedAt;
}
