/**
 * Converts a package name into the Nexus package source stored in settings.
 *
 * @param packageName npm package name or npm-prefixed source.
 * @returns npm-prefixed package source.
 */
export function createPackageSource(packageName: string): string {
	const trimmed = packageName.trim();
	return trimmed.startsWith("npm:") ? trimmed : `npm:${trimmed}`;
}
