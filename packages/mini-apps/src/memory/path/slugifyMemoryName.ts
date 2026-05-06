/**
 * Converts user-facing memory names into stable lowercase file or folder slugs.
 *
 * @param value Name or URL fragment to slugify.
 * @returns Filesystem-safe slug.
 */
export function slugifyMemoryName(value: string): string {
	const slug = value
		.toLowerCase()
		.replace(/https?:\/\//g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80);
	return slug || "memory-item";
}
