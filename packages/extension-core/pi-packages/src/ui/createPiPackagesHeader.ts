import type { PiPackagesTab } from "../model/types";
import { formatPiPackagesTabs } from "./formatPiPackagesTabs";

/**
 * Creates the Pi packages header with right-aligned tabs.
 *
 * @param title Header title.
 * @param activeTab Active tab.
 * @param width Available width.
 * @param theme Active UI theme.
 * @returns Header string.
 */
export function createPiPackagesHeader(
	title: string,
	activeTab: PiPackagesTab,
	width: number,
	theme: { fg(color: string, value: string): string },
): string {
	const tabs = formatPiPackagesTabs(activeTab, theme);
	const gap = Math.max(1, width - title.length - tabs.length);
	return `${title}${" ".repeat(gap)}${tabs}`;
}
