import type { ExtensionManagerTab } from "../model/types.js";
import { formatExtensionManagerTabs } from "./formatExtensionManagerTabs.js";

/**
 * Creates the extension manager header with right-aligned tabs.
 *
 * @param title Header title.
 * @param activeTab Active tab.
 * @param width Available width.
 * @param theme Active UI theme.
 * @returns Header string.
 */
export function createExtensionManagerHeader(
	title: string,
	activeTab: ExtensionManagerTab,
	width: number,
	theme: { fg(color: string, value: string): string },
): string {
	const tabs = formatExtensionManagerTabs(activeTab, theme);
	const gap = Math.max(1, width - title.length - tabs.length);
	return `${title}${" ".repeat(gap)}${tabs}`;
}
