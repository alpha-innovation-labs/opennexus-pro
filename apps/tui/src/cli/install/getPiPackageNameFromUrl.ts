/**
 * Extracts the npm package name from a pi.dev package URL.
 *
 * @param source Raw install source.
 * @returns Package name when the source is a pi.dev package URL.
 */
export function getPiPackageNameFromUrl(source: string): string | undefined {
	try {
		const url = new URL(source);
		if (url.hostname !== "pi.dev") return undefined;
		if (!url.pathname.startsWith("/packages/")) return undefined;
		const packageName = decodeURIComponent(
			url.pathname.slice("/packages/".length),
		).trim();
		return packageName || undefined;
	} catch {
		return undefined;
	}
}
