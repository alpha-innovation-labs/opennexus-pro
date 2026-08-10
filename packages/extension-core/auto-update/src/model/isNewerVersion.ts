import { compareVersions } from "./compareVersions";

/**
 * Checks whether a candidate version is newer than the current version.
 *
 * @param currentVersion Installed Nexus version.
 * @param candidateVersion Registry candidate version.
 * @returns True when the candidate version is newer.
 */
export function isNewerVersion(currentVersion: string, candidateVersion: string): boolean {
	return compareVersions(candidateVersion, currentVersion) === 1;
}
