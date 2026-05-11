import { visibleWidth } from "@earendil-works/pi-tui";
import type { FeatureManagementTab } from "../model/types.js";
import { formatFeatureManagementTabs } from "./formatFeatureManagementTabs.js";

/**
 * Creates a header line with the title on the left and tabs aligned to the top right.
 *
 * @param title Modal title.
 * @param activeTab Active feature-management tab.
 * @param width Modal inner width.
 * @param theme Active UI theme.
 * @returns Header line.
 */
export function createFeatureManagementHeader(
	title: string,
	activeTab: FeatureManagementTab,
	width: number,
	theme: { fg(color: string, value: string): string },
): string {
	const tabs = formatFeatureManagementTabs(activeTab, theme);
	const gap = Math.max(1, width - visibleWidth(title) - visibleWidth(tabs));
	return `${title}${" ".repeat(gap)}${tabs}`;
}
