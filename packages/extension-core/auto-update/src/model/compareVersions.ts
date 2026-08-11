import { parseVersionParts } from "./parseVersionParts";

/**
 * Compares two semantic version strings numerically.
 *
 * @param left First version string.
 * @param right Second version string.
 * @returns 1 when left is newer, -1 when right is newer, otherwise 0.
 */
export function compareVersions(left: string, right: string): -1 | 0 | 1 {
	const leftParts = parseVersionParts(left);
	const rightParts = parseVersionParts(right);
	for (let index = 0; index < leftParts.length; index += 1) {
		const leftPart = leftParts[index] ?? 0;
		const rightPart = rightParts[index] ?? 0;
		if (leftPart > rightPart) return 1;
		if (leftPart < rightPart) return -1;
	}
	return 0;
}
