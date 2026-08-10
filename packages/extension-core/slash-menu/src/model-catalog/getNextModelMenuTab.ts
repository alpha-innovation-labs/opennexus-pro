import { createModelMenuTabs } from "./createModelMenuTabs";
import type { ModelMenuTab } from "./ModelMenuTab";

/**
 * Selects the next model-menu tab with wraparound.
 *
 * @param currentTab Current model-menu tab.
 * @param direction Direction to move through tabs.
 * @returns Next tab id.
 */
export function getNextModelMenuTab(currentTab: ModelMenuTab, direction: 1 | -1): ModelMenuTab {
  const tabs = createModelMenuTabs();
  const currentIndex = tabs.indexOf(currentTab);
  const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
  return tabs[nextIndex]!;
}
