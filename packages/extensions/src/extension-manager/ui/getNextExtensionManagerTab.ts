import type { ExtensionManagerTab } from "../model/types.js";

const tabs: ExtensionManagerTab[] = ["all", "core", "user"];

/**
 * Gets the next extension manager tab for keyboard navigation.
 *
 * @param current Current tab.
 * @param direction Navigation direction.
 * @returns Next tab.
 */
export function getNextExtensionManagerTab(current: ExtensionManagerTab, direction: 1 | -1): ExtensionManagerTab {
	const currentIndex = tabs.indexOf(current);
	return tabs[(currentIndex + direction + tabs.length) % tabs.length];
}
