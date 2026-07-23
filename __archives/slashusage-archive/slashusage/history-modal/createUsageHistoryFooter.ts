import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import { formatUsageHistoryModelTab } from "./formatUsageHistoryModelTab.js";
import type { UsageHistoryModelOption } from "./createUsageHistoryModelOptions.js";

/**
 * Creates footer lines with selectable model/subscription tabs.
 *
 * @param options Model options.
 * @param selectedIndex Selected model index.
 * @param theme UI theme.
 * @returns Footer lines for the usage history modal.
 */
export function createUsageHistoryFooter(options: UsageHistoryModelOption[], selectedIndex: number, theme: SharedModalTheme): string[] {
  if (options.length === 0) return [theme.fg("muted", "No models tracked yet")];
  return [options.map((option, index) => formatUsageHistoryModelTab(option, index === selectedIndex, theme)).join(theme.fg("dim", " │ "))];
}
