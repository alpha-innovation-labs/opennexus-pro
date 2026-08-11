/**
 * Detects Bun's virtual filesystem markers in an import URL.
 *
 * @param importMetaUrl Module URL to inspect.
 * @returns True when the URL points inside a Bun compiled binary.
 */
export function hasBunBinaryMarker(importMetaUrl: string): boolean {
	return (
		importMetaUrl.includes("$bunfs") ||
		importMetaUrl.includes("~BUN") ||
		importMetaUrl.includes("%7EBUN")
	);
}
