import type { ShowcaseGroup } from "../types/showcase-feature";

/**
 * Finds the first showcase group id from the visible content model.
 *
 * @param groups Ordered showcase groups.
 * @returns The first group id, or an empty string when no groups exist.
 */
export function getFirstShowcaseGroupId(
	groups: readonly ShowcaseGroup[],
): string {
	return groups[0]?.id ?? "";
}
