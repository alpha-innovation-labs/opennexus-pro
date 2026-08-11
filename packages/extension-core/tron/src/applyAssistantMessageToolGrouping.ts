/**
 * Standalone tool mode does not derive any cross-message grouping metadata.
 *
 * @param message Assistant message payload.
 */
export function applyAssistantMessageToolGrouping(message: {
	timestamp?: unknown;
	content?: Array<{
		type?: unknown;
		id?: unknown;
		text?: unknown;
		thinking?: unknown;
	}>;
}): void {
	void message;
}
