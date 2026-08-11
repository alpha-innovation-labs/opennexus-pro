import type { ShowcaseGroup } from "../types/showcase-feature";
import type { ShowcaseTerminalItem } from "../types/showcase-terminal-item";

const ORIGINAL_NEXUS_CAST_SRC = "/recordings/demo.cast";

/**
 * Flattens grouped showcase content into scroll-synced terminal items using the original cast.
 *
 * @param groups Showcase groups with examples.
 * @returns Terminal items in rendered scroll order.
 */
export function flattenShowcaseTerminalItems(
	groups: readonly ShowcaseGroup[],
): readonly ShowcaseTerminalItem[] {
	return groups.flatMap((group) =>
		group.examples.map((example) => ({
			example,
			groupId: group.id,
			groupLabel: group.label,
			castSrc: ORIGINAL_NEXUS_CAST_SRC,
		})),
	);
}
