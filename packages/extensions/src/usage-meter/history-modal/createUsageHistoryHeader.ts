import { visibleWidth } from "@mariozechner/pi-tui";
import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import { createUsageHistoryWindowOptions } from "./createUsageHistoryWindowOptions.js";
import { formatUsageHistoryWindowTab } from "./formatUsageHistoryWindowTab.js";

/**
 * Creates the usage history header with right-aligned window selectors.
 *
 * @param theme UI theme.
 * @param selectedWindowIndex Selected window option index.
 * @param width Available header width.
 * @returns Header line.
 */
export function createUsageHistoryHeader(theme: SharedModalTheme, selectedWindowIndex: number, width: number): string {
  const title = theme.fg("accent", "Usage history");
  const tabs = createUsageHistoryWindowOptions()
    .map((option, index) => formatUsageHistoryWindowTab(option, index === selectedWindowIndex, theme))
    .join(theme.fg("dim", " | "));
  const spacing = " ".repeat(Math.max(1, width - visibleWidth(title) - visibleWidth(tabs)));
  return `${title}${spacing}${tabs}`;
}
