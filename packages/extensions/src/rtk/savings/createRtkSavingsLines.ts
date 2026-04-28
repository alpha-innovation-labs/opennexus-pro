import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { RtkGainReport } from "./RtkGainReport.js";
import type { RtkSavingsPeriodKey } from "./RtkSavingsPeriodKey.js";
import { colorizeSavingsPercent } from "./colorizeSavingsPercent.js";
import { colorizeSavingsValue } from "./colorizeSavingsValue.js";
import { createEfficiencyMeter } from "./createEfficiencyMeter.js";
import { formatPercent } from "./formatPercent.js";
import { formatRtkSavingsMetricLine } from "./formatRtkSavingsMetricLine.js";
import { formatTokenCount } from "./formatTokenCount.js";
import { getRtkSavingsPeriod } from "./getRtkSavingsPeriod.js";
import { getRtkSavingsPeriodLabel } from "./getRtkSavingsPeriodLabel.js";

/**
 * Creates the body rows for the RTK savings modal.
 *
 * @param report Parsed RTK gain report.
 * @param theme Active UI theme.
 * @param selectedPeriod Selected period key.
 * @returns Modal body lines.
 */
export function createRtkSavingsLines(
  report: RtkGainReport,
  theme: SharedModalTheme,
  selectedPeriod: RtkSavingsPeriodKey,
): string[] {
  const period = getRtkSavingsPeriod(report, selectedPeriod);
  const label = getRtkSavingsPeriodLabel(selectedPeriod);
  if (!period) return [theme.fg("muted", `No ${label.toLowerCase()} savings data yet.`)];

  return [
    formatRtkSavingsMetricLine(`${label} saved`, colorizeSavingsValue(theme, formatTokenCount(period.saved_tokens))),
    formatRtkSavingsMetricLine("Commands", colorizeSavingsValue(theme, period.commands.toLocaleString())),
    formatRtkSavingsMetricLine("Input tokens", colorizeSavingsValue(theme, formatTokenCount(period.input_tokens))),
    formatRtkSavingsMetricLine("Output tokens", colorizeSavingsValue(theme, formatTokenCount(period.output_tokens))),
    formatRtkSavingsMetricLine("Efficiency", `${createEfficiencyMeter(theme, period.savings_pct)} ${colorizeSavingsPercent(theme, formatPercent(period.savings_pct))}`),
  ];
}
