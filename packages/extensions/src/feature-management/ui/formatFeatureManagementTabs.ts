import type { FeatureManagementTab } from "../model/types.js";
import { createFeatureManagementTabs } from "./createFeatureManagementTabs.js";
import { formatFeatureManagementTab } from "./formatFeatureManagementTab.js";

/**
 * Formats the feature-management tab strip label.
 *
 * @param activeTab Currently active feature tab.
 * @param theme Active UI theme.
 * @returns Tab strip text with the active tab marked.
 */
export function formatFeatureManagementTabs(
	activeTab: FeatureManagementTab,
	theme: { fg(color: string, value: string): string },
): string {
	return createFeatureManagementTabs()
		.map((tab) => formatFeatureManagementTab(tab, tab === activeTab, theme))
		.join(theme.fg("dim", " | "));
}
