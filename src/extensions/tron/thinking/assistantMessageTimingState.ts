const TIMING_BY_TIMESTAMP = new Map<number, string>();
const STARTED_AT_BY_TIMESTAMP = new Map<number, number>();
let currentAssistantStartedAt: number | undefined;

/**
 * Clears all assistant timing state.
 */
export function resetAssistantMessageTimings(): void {
	TIMING_BY_TIMESTAMP.clear();
	STARTED_AT_BY_TIMESTAMP.clear();
	currentAssistantStartedAt = undefined;
}

/**
 * Marks the start of the current assistant response.
 *
 * @param timestamp Start timestamp.
 */
export function startAssistantMessageTiming(timestamp: number): void {
	currentAssistantStartedAt = timestamp;
}

/**
 * Stores the final duration label for one assistant message.
 *
 * @param messageTimestamp Final assistant message timestamp.
 * @param durationLabel Compact duration label.
 */
export function finishAssistantMessageTiming(messageTimestamp: number, durationLabel: string): void {
	TIMING_BY_TIMESTAMP.set(messageTimestamp, durationLabel);
	if (typeof currentAssistantStartedAt === "number") STARTED_AT_BY_TIMESTAMP.set(messageTimestamp, currentAssistantStartedAt);
	currentAssistantStartedAt = undefined;
}

/**
 * Reads the active assistant start timestamp.
 *
 * @returns Current assistant start timestamp.
 */
export function getCurrentAssistantStartedAt(): number | undefined {
	return currentAssistantStartedAt;
}

/**
 * Reads the stored duration label for one assistant message.
 *
 * @param messageTimestamp Assistant message timestamp.
 * @returns Stored duration label.
 */
export function getAssistantMessageTiming(messageTimestamp: number): string | undefined {
	return TIMING_BY_TIMESTAMP.get(messageTimestamp);
}

/**
 * Reads the stored start time for one assistant message.
 *
 * @param messageTimestamp Assistant message timestamp.
 * @returns Stored start timestamp.
 */
export function getAssistantMessageStartedAt(messageTimestamp: number): number | undefined {
	return STARTED_AT_BY_TIMESTAMP.get(messageTimestamp);
}
