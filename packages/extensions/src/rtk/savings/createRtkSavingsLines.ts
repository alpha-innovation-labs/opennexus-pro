import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { RtkGainReport } from "./RtkGainReport.js";
import type { RtkSavingsPeriodKey } from "./RtkSavingsPeriodKey.js";
import type { SavingsReport } from "./SavingsReport.js";
import { calculateSavedShare } from "./calculateSavedShare.js";
import { colorizeSavingsPercent } from "./colorizeSavingsPercent.js";
import { colorizeSavingsValue } from "./colorizeSavingsValue.js";
import { createEfficiencyMeter } from "./createEfficiencyMeter.js";
import { createTokenCostReport } from "../pricing/createTokenCostReport.js";
import { formatDollar } from "./formatDollar.js";
import { formatPercent } from "./formatPercent.js";
import { formatRtkSavingsMetricLine } from "./formatRtkSavingsMetricLine.js";
import { formatSavingsDividerLine } from "./formatSavingsDividerLine.js";
import { formatTokenCount } from "./formatTokenCount.js";
import { getRtkSavingsPeriod } from "./getRtkSavingsPeriod.js";
import { getRtkSavingsPeriodLabel } from "./getRtkSavingsPeriodLabel.js";
import { getSavingsReportRtk } from "./getSavingsReportRtk.js";
import { getTokenUsagePeriod } from "../usage/getTokenUsagePeriod.js";

/**
 * Creates the body rows for the RTK savings modal.
 *
 * @param report Parsed RTK gain report.
 * @param theme Active UI theme.
 * @param selectedPeriod Selected period key.
 * @returns Modal body lines.
 */
export function createRtkSavingsLines(
  report: RtkGainReport | SavingsReport,
  theme: SharedModalTheme,
  selectedPeriod: RtkSavingsPeriodKey,
): string[] {
  const rtkReport = getSavingsReportRtk(report);
  const period = getRtkSavingsPeriod(rtkReport, selectedPeriod);
  const label = getRtkSavingsPeriodLabel(selectedPeriod);
  if (!period) return [theme.fg("muted", `No ${label.toLowerCase()} savings data yet.`)];

  const usage = "usage" in report && report.usage ? getTokenUsagePeriod(report.usage, selectedPeriod) : undefined;
  const pricing = "pricing" in report ? report.pricing : undefined;
  const cost = pricing && usage ? createTokenCostReport(usage, period, pricing) : undefined;
  const savedShare = calculateSavedShare(period);
  const lines = [
    formatRtkSavingsMetricLine("Total input", colorizeSavingsValue(theme, formatTokenCount(usage?.input ?? period.input_tokens))),
    formatRtkSavingsMetricLine("Total output", colorizeSavingsValue(theme, formatTokenCount(usage?.output ?? period.output_tokens))),
    formatRtkSavingsMetricLine("Cached input", colorizeSavingsValue(theme, formatTokenCount(usage?.cacheRead ?? 0))),
    formatRtkSavingsMetricLine("Cached output", colorizeSavingsValue(theme, formatTokenCount(usage?.cacheWrite ?? 0))),
    formatRtkSavingsMetricLine("Nexus input saved", colorizeSavingsValue(theme, formatTokenCount(period.saved_tokens))),
    formatRtkSavingsMetricLine("Nexus output saved", colorizeSavingsValue(theme, formatTokenCount(0))),
    formatRtkSavingsMetricLine("Saved share", `${createEfficiencyMeter(theme, savedShare)} ${colorizeSavingsPercent(theme, formatPercent(savedShare))}`),
  ];

  if (cost) {
    lines.push(
      "",
      theme.fg("accent", `OpenRouter ${cost.pricing.modelId} (m)`),
      formatRtkSavingsMetricLine("Input cost", formatDollar(cost.inputCost)),
      formatRtkSavingsMetricLine("Output cost", formatDollar(cost.outputCost)),
      formatRtkSavingsMetricLine("Cached cost", formatDollar(cost.cachedCost)),
      formatSavingsDividerLine(),
      formatRtkSavingsMetricLine("Total cost", theme.fg("error", formatDollar(cost.totalCost))),
      formatRtkSavingsMetricLine("Nexus $ saved", theme.fg("success", formatDollar(cost.savedCost))),
    );
  }

  return lines;
}
