import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import { createModelMenuTabs } from "./createModelMenuTabs.js";
import { formatModelMenuTab } from "./formatModelMenuTab.js";
import type { ModelMenuTab } from "./ModelMenuTab.js";

/**
 * Renders the model-menu tab header.
 *
 * @param selectedTab Active model-menu tab.
 * @param theme Active UI theme.
 * @returns Styled tab header.
 */
export function renderModelMenuTabs(selectedTab: ModelMenuTab, theme: SharedModalTheme): string {
  return createModelMenuTabs()
    .map((tab) => formatModelMenuTab(tab, tab === selectedTab, theme))
    .join(theme.fg("dim", " | "));
}
