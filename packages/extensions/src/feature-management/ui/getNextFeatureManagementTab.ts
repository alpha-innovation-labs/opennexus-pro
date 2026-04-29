import type { FeatureManagementTab } from "../model/types.js";
import { createFeatureManagementTabs } from "./createFeatureManagementTabs.js";

/**
 * Selects the next feature-management tab, wrapping at either edge.
 *
 * @param activeTab Currently active tab.
 * @param direction Tab traversal direction.
 * @returns Next active tab.
 */
export function getNextFeatureManagementTab(activeTab: FeatureManagementTab, direction: 1 | -1): FeatureManagementTab {
	const tabs = createFeatureManagementTabs();
	const index = tabs.indexOf(activeTab);
	const nextIndex = (index + direction + tabs.length) % tabs.length;
	return tabs[nextIndex];
}
