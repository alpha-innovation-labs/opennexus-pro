/**
 * Resolves the lock directory path for a cmux session registry file.
 *
 * @param registryPath Registry file path.
 * @returns Lock directory path.
 */
export function getCmuxSessionRegistryLockPath(registryPath: string): string {
	return `${registryPath}.lock`;
}
