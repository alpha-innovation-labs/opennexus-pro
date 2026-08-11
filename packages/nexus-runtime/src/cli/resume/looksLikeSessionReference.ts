/**
 * Returns whether a CLI token looks like a session file path or session ID.
 *
 * @param value CLI token.
 * @returns True when the token can be treated as a direct session reference.
 */
export function looksLikeSessionReference(value: string): boolean {
	if (value.includes("/") || value.includes("\\") || value.endsWith(".jsonl")) {
		return true;
	}

	return /^[0-9a-f-]{8,}$/i.test(value);
}
