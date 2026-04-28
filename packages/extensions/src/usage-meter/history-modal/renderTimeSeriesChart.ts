import { createBrailleChart } from "./createBrailleChart.js";
import { createChartAxisLabels } from "./createChartAxisLabels.js";
import { getSeriesValueDomain } from "./getSeriesValueDomain.js";
import { getUsageChartHeight } from "./getUsageChartHeight.js";
import { renderTimeAxis } from "./renderTimeAxis.js";
import { selectChartPoints } from "./selectChartPoints.js";
import type { UsageHistorySeries } from "./groupUsageHistoryRecords.js";

/**
 * Renders one usage history series as a dense braille over-time chart.
 *
 * @param series Usage history series.
 * @param width Available modal width.
 * @returns Chart lines.
 */
export function renderTimeSeriesChart(series: UsageHistorySeries, width: number): string[] {
  const latest = series.records.at(-1)!;
  const title = `${latest.provider} ${latest.label} · latest ${latest.unit === "usd" ? `$${latest.value.toFixed(2)}` : `${Math.round(latest.value)}%`}`;
  const plotWidth = Math.max(12, width - 8);
  const points = selectChartPoints(series.records, plotWidth * 2);
  const domain = getSeriesValueDomain(points, latest.unit);
  const chartRows = createBrailleChart(points, plotWidth, getUsageChartHeight(latest.unit));
  const labels = createChartAxisLabels(chartRows.length, domain.min, domain.max, latest.unit);

  return [
    title,
    ...chartRows.map((row, index) => `${labels[index] ?? "     "} │${row}`),
    renderTimeAxis(points, plotWidth),
  ];
}
