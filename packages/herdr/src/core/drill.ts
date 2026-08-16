/**
 * Core result drilling utility.
 *
 * Extracts a value from nested object keys, returning `undefined` if any
 * key in the path is missing or not a string. Used by every module to
 * safely navigate the JSON response shape from the `herdr` CLI.
 */

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Drills into nested object keys, returning undefined if any key is missing.
 *
 * @param data Root object to drill into.
 * @param keys Key path to follow.
 * @returns The final string value, or `undefined`.
 */
export function drill(
	data: Record<string, unknown>,
	...keys: string[]
): string | undefined {
	let current: unknown = data;
	for (const key of keys) {
		if (
			typeof current === "object" &&
			current !== null &&
			key in (current as Record<string, unknown>)
		) {
			current = (current as Record<string, unknown>)[key];
		} else {
			return undefined;
		}
	}
	return typeof current === "string" ? current : undefined;
}
