import type { UsageHistoryRecord } from "../history/types.js";
import { createBrailleCanvas } from "./createBrailleCanvas.js";
import { drawBrailleLine } from "./drawBrailleLine.js";
import { getSeriesValueDomain } from "./getSeriesValueDomain.js";
import { renderBrailleCanvas } from "./renderBrailleCanvas.js";
import { getUsageChartX } from "./getUsageChartX.js";
import { selectChartPoints } from "./selectChartPoints.js";
import type { UsageChartTimeRange } from "./createUsageChartTimeRange.js";

/**
 * Creates a dense braille line chart for one usage series.
 *
 * @param records Series records.
 * @param width Chart width in terminal cells.
 * @param height Chart height in terminal rows.
 * @param timeRange Optional time range for timestamp-based x projection.
 * @returns Braille chart rows.
 */
export function createBrailleChart(records: UsageHistoryRecord[], width: number, height: number, timeRange?: UsageChartTimeRange): string[] {
  const points = selectChartPoints(records, width * 2);
  if (points.length === 0) return [];
  const canvas = createBrailleCanvas(width, height);
  const domain = getSeriesValueDomain(points, points.at(-1)!.unit);
  const pixelWidth = Math.max(1, width * 2 - 1);
  const pixelHeight = Math.max(1, height * 4 - 1);
  const plotted = points.map((point, index) => ({
    x: timeRange
      ? getUsageChartX(point.sampledAt, timeRange, pixelWidth + 1)
      : Math.round((index / Math.max(1, points.length - 1)) * pixelWidth),
    y: Math.round(pixelHeight - ((point.value - domain.min) / Math.max(1, domain.max - domain.min)) * pixelHeight),
  }));

  for (let index = 1; index < plotted.length; index += 1) {
    const previous = plotted[index - 1]!;
    const current = plotted[index]!;
    drawBrailleLine(canvas, previous.x, previous.y, current.x, current.y);
  }
  if (plotted.length === 1) drawBrailleLine(canvas, plotted[0]!.x, plotted[0]!.y, plotted[0]!.x, plotted[0]!.y);
  return renderBrailleCanvas(canvas);
}
