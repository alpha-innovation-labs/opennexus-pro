/**
 * Standalone tool mode does not collect collapsed-group timing state.
 *
 * @param toolCallId Tool call id.
 * @param finishedAt Finish timestamp in milliseconds.
 */
export function noteCollapsedToolExecutionEnd(
	toolCallId: string,
	finishedAt = Date.now(),
): void {
	void toolCallId;
	void finishedAt;
}
