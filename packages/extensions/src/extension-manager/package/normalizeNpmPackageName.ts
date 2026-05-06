/**
 * Extracts the npm package name from a Nexus/Pi npm package source.
 *
 * @param source Package source such as npm:pkg, npm:@scope/pkg, or npm:pkg@1.0.0.
 * @returns The package name without the npm prefix or version pin.
 */
export function normalizeNpmPackageName(source: string): string {
	const withoutPrefix = source.startsWith("npm:") ? source.slice(4) : source;
	if (withoutPrefix.startsWith("@")) {
		const versionMarker = withoutPrefix.indexOf("@", 1);
		return versionMarker === -1 ? withoutPrefix : withoutPrefix.slice(0, versionMarker);
	}
	const versionMarker = withoutPrefix.indexOf("@");
	return versionMarker === -1 ? withoutPrefix : withoutPrefix.slice(0, versionMarker);
}
