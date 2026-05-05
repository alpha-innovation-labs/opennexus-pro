/**
 * Checks whether text matches a case-insensitive memory query.
 *
 * @param text Text to search.
 * @param query Query to match.
 * @returns True when query is empty or found in text.
 */
export function matchesMemoryQuery(text: string, query: string): boolean {
	const normalized = query.trim().toLowerCase();
	return normalized.length === 0 || text.toLowerCase().includes(normalized);
}
