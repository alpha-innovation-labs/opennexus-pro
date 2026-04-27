/**
 * Narrows a plain record into a string dictionary.
 *
 * @param value Unknown config value.
 * @returns String dictionary view.
 */
export function toStringRecord(value: unknown): Record<string, string> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return {};
	}
	const result: Record<string, string> = {};
	for (const [key, entry] of Object.entries(value)) {
		if (typeof entry === "string") {
			result[key] = entry;
		}
	}
	return result;
}
