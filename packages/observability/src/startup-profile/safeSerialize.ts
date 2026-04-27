/**
 * Safely serializes a value for log output.
 *
 * @param value Value to serialize.
 * @returns JSON-safe string.
 */
export function safeSerialize(value: unknown): string {
	try {
		return JSON.stringify(value);
	} catch {
		return JSON.stringify(String(value));
	}
}
