import type { SharedModalTheme } from "@nexus/tui-kit/modal/index";
import { getModelMenuTabLabel } from "./getModelMenuTabLabel";
import type { ModelMenuTab } from "./ModelMenuTab";

/**
 * Formats one model-menu tab marker.
 *
 * @param tab Tab to format.
 * @param selected Whether this tab is active.
 * @param theme Active UI theme.
 * @returns Styled tab label.
 */
export function formatModelMenuTab(tab: ModelMenuTab, selected: boolean, theme: SharedModalTheme): string {
  const label = getModelMenuTabLabel(tab);
  return selected ? theme.fg("accent", `● ${label}`) : theme.fg("muted", `○ ${label}`);
}
