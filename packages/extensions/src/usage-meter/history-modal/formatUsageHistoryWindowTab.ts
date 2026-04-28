import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { UsageHistoryWindowOption } from "./types.js";

/**
 * Formats one window selector tab for the usage history header.
 *
 * @param option Window option.
 * @param selected Whether the tab is selected.
 * @param theme UI theme.
 * @returns Rendered tab label.
 */
export function formatUsageHistoryWindowTab(option: UsageHistoryWindowOption, selected: boolean, theme: SharedModalTheme): string {
  const label = option === "week" ? "1W [1]" : "5h [2]";
  return selected ? theme.fg("accent", `● ${label}`) : theme.fg("muted", `○ ${label}`);
}
