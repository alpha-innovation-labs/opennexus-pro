import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { UsageHistoryModelOption } from "./createUsageHistoryModelOptions.js";

/**
 * Formats one model/subscription tab for the usage history footer.
 *
 * @param option Model option.
 * @param selected Whether this option is selected.
 * @param theme UI theme.
 * @returns Rendered tab label.
 */
export function formatUsageHistoryModelTab(option: UsageHistoryModelOption, selected: boolean, theme: SharedModalTheme): string {
  return selected ? theme.fg("accent", `● ${option.label}`) : theme.fg("muted", `○ ${option.label}`);
}
