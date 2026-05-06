import type { FeatureManagementTab } from "../model/types.js";

const FEATURE_MANAGEMENT_TAB_LABELS: Record<FeatureManagementTab, string> = {
	extensions: "Extensions",
	"mini-apps": "Mini-Apps",
};

/**
 * Formats one feature-management tab using the shared resource-selector style.
 *
 * @param tab Feature-management tab.
 * @param selected Whether the tab is selected.
 * @param theme Active UI theme.
 * @returns Rendered tab label.
 */
export function formatFeatureManagementTab(
	tab: FeatureManagementTab,
	selected: boolean,
	theme: { fg(color: string, value: string): string },
): string {
	const label = FEATURE_MANAGEMENT_TAB_LABELS[tab];
	return selected ? theme.fg("accent", `● ${label}`) : theme.fg("muted", `○ ${label}`);
}
