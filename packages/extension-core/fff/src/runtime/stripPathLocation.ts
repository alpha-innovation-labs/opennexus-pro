/**
 * Removes trailing line or range suffixes from a path query.
 *
 * @param query Raw path query.
 * @returns Path-only query.
 */
export function stripPathLocation(query: string): string {
	return query
		.replace(/:(\d+):(\d+)-(\d+):(\d+)$/, "")
		.replace(/:(\d+):(\d+)$/, "")
		.replace(/:(\d+)$/, "");
}
