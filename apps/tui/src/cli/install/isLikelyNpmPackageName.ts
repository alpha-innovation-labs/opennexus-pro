const NPM_PACKAGE_PATTERN =
	/^(?:@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*|[a-z0-9][a-z0-9._-]*)(?:@[a-z0-9._+-]+)?$/iu;

/**
 * Reports whether a source looks like a bare npm package spec.
 *
 * @param source Raw install source.
 * @returns True when the value should be converted to an npm: source.
 */
export function isLikelyNpmPackageName(source: string): boolean {
	return NPM_PACKAGE_PATTERN.test(source);
}
