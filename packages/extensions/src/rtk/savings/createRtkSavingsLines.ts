import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { RtkGainReport } from "./RtkGainReport.js";
import { colorizeSavingsPercent } from "./colorizeSavingsPercent.js";
import { colorizeSavingsValue } from "./colorizeSavingsValue.js";
import { createEfficiencyMeter } from "./createEfficiencyMeter.js";
import { formatPercent } from "./formatPercent.js";
import { formatTokenCount } from "./formatTokenCount.js";

/**
 * Creates the body rows for the RTK savings modal.
 *
 * @param report Parsed RTK gain report.
 * @param theme Active UI theme.
 * @returns Modal body lines.
 */
export function createRtkSavingsLines(report: RtkGainReport, theme: SharedModalTheme): string[] {
  const summary = report.summary;
  return [
    `Saved tokens      ${colorizeSavingsValue(theme, formatTokenCount(summary.total_saved))}`,
    `Savings rate      ${colorizeSavingsPercent(theme, formatPercent(summary.avg_savings_pct))}`,
    `Efficiency        ${createEfficiencyMeter(theme, summary.avg_savings_pct)}`,
    `Commands          ${colorizeSavingsValue(theme, summary.total_commands.toLocaleString())}`,
    `Input tokens      ${colorizeSavingsValue(theme, formatTokenCount(summary.total_input))}`,
    `Output tokens     ${colorizeSavingsValue(theme, formatTokenCount(summary.total_output))}`,
  ];
}
