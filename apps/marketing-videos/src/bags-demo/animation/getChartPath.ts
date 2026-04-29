/**
 * Builds an SVG path from normalized price points.
 *
 * @param points Normalized price points.
 * @param width Chart width.
 * @param height Chart height.
 * @returns SVG path data for the line chart.
 */
export function getChartPath(points: readonly number[], width: number, height: number): string {
  return points
    .map((point, index) => {
      const x = (index / Math.max(1, points.length - 1)) * width;
      const y = height - (point / 100) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}
