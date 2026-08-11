type TimestampedMessageEntry = {
	timestamp?: string | number;
	message?: { timestamp?: string | number };
};

/**
 * Resolves the best timestamp for a session entry.
 *
 * @param entry Session entry with optional timestamp fields.
 * @returns Unix timestamp in milliseconds.
 */
export function getSessionEntryTimestamp(
	entry: TimestampedMessageEntry,
): number {
	const rawTimestamp = entry.message?.timestamp ?? entry.timestamp;
	if (typeof rawTimestamp === "number") return rawTimestamp;
	if (typeof rawTimestamp === "string") {
		const parsedTimestamp = Date.parse(rawTimestamp);
		if (Number.isFinite(parsedTimestamp)) return parsedTimestamp;
	}
	return Date.now();
}
