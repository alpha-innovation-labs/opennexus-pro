import type { PiPackagesTab } from "../model/types.js";

const tabs: PiPackagesTab[] = ["all", "third-party"];

/**
 * Gets the next Pi packages tab for keyboard navigation.
 *
 * @param current Current tab.
 * @param direction Navigation direction.
 * @returns Next tab.
 */
export function getNextPiPackagesTab(current: PiPackagesTab, direction: 1 | -1): PiPackagesTab {
	const currentIndex = tabs.indexOf(current);
	return tabs[(currentIndex + direction + tabs.length) % tabs.length];
}
