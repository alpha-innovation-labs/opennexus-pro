import { colorUsageChartRow, getUsageChartRowColor } from "./colorUsageChartRow.js";
import { createBrailleChart } from "./createBrailleChart.js";
import { createUsageChartTimeRange } from "./createUsageChartTimeRange.js";
import { createUsagePaceStatus, formatUsagePaceStatus } from "./createUsagePaceStatus.js";
import { createUsageProgressStatus, createUsageResetStatus } from "./createUsageResetStatus.js";
import { createChartAxisLabels } from "./createChartAxisLabels.js";
import { getSeriesValueDomain } from "./getSeriesValueDomain.js";
import { getUsageChartHeight } from "./getUsageChartHeight.js";
import { getUsagePercentAxisStep } from "./getUsagePercentAxisStep.js";
import { getUsageChartX } from "./getUsageChartX.js";
import { overlayUsageResetMarker } from "./overlayUsageResetMarker.js";
import { renderTimeAxis } from "./renderTimeAxis.js";
import { selectChartPoints } from "./selectChartPoints.js";
import type { UsageHistorySeries } from "./groupUsageHistoryRecords.js";

/**
 * Renders one usage history series as a dense braille over-time chart.
 *
 * @param series Usage history series.
 * @param width Available modal width.
 * @param maxRows Maximum rows available for this chart.
 * @returns Chart lines.
 */
export function renderTimeSeriesChart(series: UsageHistorySeries, width: number, maxRows = Number.POSITIVE_INFINITY): string[] {
  const latest = series.records.at(-1)!;
  const plotWidth = Math.max(12, width - 8);
  const timeRange = createUsageChartTimeRange(series.records);
  const paceStatus = createUsagePaceStatus(latest);
  const progressStatus = createUsageProgressStatus(latest, timeRange);
  const resetStatus = createUsageResetStatus(latest, timeRange);
  const paceText = paceStatus ? formatUsagePaceStatus(paceStatus) : undefined;
  const usageStatus = [progressStatus, paceText].filter((value): value is string => Boolean(value)).join(" ");
  const bottomStatus = [usageStatus || undefined, resetStatus].filter((value): value is string => Boolean(value)).join(" · ");
  const title = `${latest.provider} ${latest.label} · latest ${latest.unit === "usd" ? `$${latest.value.toFixed(2)}` : `${Math.round(latest.value)}%`}`;
  const points = selectChartPoints(series.records, plotWidth * 2);
  const domain = getSeriesValueDomain(points, latest.unit);
  const chartHeight = getUsageChartHeight(latest.unit, maxRows);
  const chartRows = createBrailleChart(points, plotWidth, chartHeight, timeRange);
  const percentStep = getUsagePercentAxisStep(maxRows);
  const labels = createChartAxisLabels(chartRows.length, domain.min, domain.max, latest.unit, percentStep);

  const resetColumn = timeRange.resetAt === undefined ? undefined : getUsageChartX(timeRange.resetAt, timeRange, plotWidth);

  return [
    title,
    ...chartRows.map((row, index) => `${labels[index] ?? "     "} │${renderChartRow(row, latest.unit, 100 - index * percentStep, resetColumn)}`),
    renderTimeAxis(points, plotWidth, timeRange, bottomStatus),
  ];
}

/**
 * Renders one chart row with percent coloring and reset marker overlay.
 *
 * @param row Plain chart row.
 * @param unit Chart unit.
 * @param percent Percent represented by the row.
 * @param resetColumn Optional reset marker column.
 * @returns Rendered chart row.
 */
function renderChartRow(row: string, unit: string, percent: number, resetColumn: number | undefined): string {
  if (unit !== "percent") return overlayUsageResetMarker(row, resetColumn);
  const color = getUsageChartRowColor(percent);
  return colorUsageChartRow(overlayUsageResetMarker(row, resetColumn, color), percent);
}
