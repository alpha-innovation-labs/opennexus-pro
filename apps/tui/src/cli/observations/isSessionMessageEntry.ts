type SessionMessageEntry = {
	type?: string;
	id?: string;
	timestamp?: string | number;
	message?: {
		role?: string;
		timestamp?: string | number;
		content?:
			| string
			| Array<{ type?: string; text?: string; thinking?: string }>;
	};
};

/**
 * Checks whether a raw session entry is a user or assistant message entry.
 *
 * @param entry Raw session entry.
 * @returns True when entry can be used for observations.
 */
export function isSessionMessageEntry(
	entry: unknown,
): entry is SessionMessageEntry {
	if (!entry || typeof entry !== "object") return false;
	const candidate = entry as SessionMessageEntry;
	return (
		candidate.type === "message" &&
		typeof candidate.id === "string" &&
		(candidate.message?.role === "user" ||
			candidate.message?.role === "assistant")
	);
}
