import { readCliPackageVersion } from "./readCliPackageVersion";

/**
 * Prints the packaged Nexus version to stdout.
 *
 * @returns A promise that resolves after the version is written.
 */
export async function printAppVersion(): Promise<void> {
	console.log(await readCliPackageVersion());
}
