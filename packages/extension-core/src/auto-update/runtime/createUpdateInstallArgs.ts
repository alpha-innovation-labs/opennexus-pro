/**
 * Creates npm arguments that install the current package at the latest tag globally.
 *
 * @param packageName npm package name to update.
 * @returns Argument list for npm.
 */
export function createUpdateInstallArgs(packageName: string): string[] {
	return ["install", "-g", `${packageName}@latest`];
}
