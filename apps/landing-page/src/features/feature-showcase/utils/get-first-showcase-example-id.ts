import type { ShowcaseGroup } from "../types/showcase-feature";

/**
 * Finds the first showcase example id from the visible content model.
 *
 * @param groups Ordered showcase groups.
 * @returns The first example id, or an empty string when no examples exist.
 */
export function getFirstShowcaseExampleId(
	groups: readonly ShowcaseGroup[],
): string {
	return groups[0]?.examples[0]?.id ?? "";
}
