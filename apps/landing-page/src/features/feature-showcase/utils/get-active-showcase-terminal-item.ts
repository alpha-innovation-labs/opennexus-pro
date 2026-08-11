import type { ShowcaseTerminalItem } from "../types/showcase-terminal-item";

/**
 * Finds the active terminal item for an example id.
 *
 * @param items Terminal items in scroll order.
 * @param activeId Active example id.
 * @returns Matching terminal item or the first item.
 */
export function getActiveShowcaseTerminalItem(
	items: readonly ShowcaseTerminalItem[],
	activeId: string,
): ShowcaseTerminalItem | undefined {
	return items.find((item) => item.example.id === activeId) ?? items[0];
}
