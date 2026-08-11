/**
 * Decodes a prefixed JSON cursor payload.
 *
 * @param cursor Encoded cursor value.
 * @param prefix Expected prefix.
 * @returns Decoded payload or null.
 */
export function decodeCursor<T>(
	cursor: string | undefined,
	prefix: string,
): T | null {
	if (!cursor?.startsWith(prefix)) return null;
	try {
		return JSON.parse(
			Buffer.from(cursor.slice(prefix.length), "base64url").toString("utf8"),
		) as T;
	} catch {
		return null;
	}
}
