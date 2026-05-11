import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { ContextUsageCategory } from "./types.js";
import { colorContextUsageMarker } from "./getContextUsageMarkerColor.js";
import { getContextUsageMeterCellCount, getContextUsageMeterCellsPerRow } from "./getContextUsageMeterCellCount.js";
import { orderContextUsageMeterCategories } from "./orderContextUsageMeterCategories.js";

/**
 * Renders a colored block-meter visualization using category markers.
 *
 * @param categories Context usage categories.
 * @param theme Shared modal theme.
 * @returns Colored meter rows.
 */
export function renderThemedContextUsageMeter(categories: readonly ContextUsageCategory[], theme: SharedModalTheme): string[] {
  const cellCount = getContextUsageMeterCellCount(categories);
  const cellsPerRow = getContextUsageMeterCellsPerRow();
  const markers = createMeterMarkers(orderContextUsageMeterCategories(categories), cellCount);
  const padded = [...markers, ...Array.from({ length: cellCount }, () => "⛶")].slice(0, cellCount);
  const rows: string[] = [];
  for (let index = 0; index < cellCount; index += cellsPerRow) {
    rows.push(padded.slice(index, index + cellsPerRow).map((marker) => colorContextUsageMarker(theme, marker)).join(" "));
  }
  return rows;
}

/**
 * Converts a percentage into a meter cell count.
 *
 * @param percent Context percentage.
 * @returns Meter cell count.
 */
function getCellCount(percent: number, cellCount: number): number {
  if (percent <= 0) return 0;
  return Math.max(1, Math.round((percent / 100) * cellCount));
}

/**
 * Creates meter markers while reserving tail cells for non-free terminal categories.
 *
 * @param categories Ordered context usage categories.
 * @param cellCount Total available cells.
 * @returns Meter markers that fit the available cells.
 */
function createMeterMarkers(categories: readonly ContextUsageCategory[], cellCount: number): string[] {
  const tailCategories = categories.filter((category) => category.label === "Autocompact buffer" && category.percent > 0);
  const tailCells = tailCategories.flatMap((category) => Array.from({ length: getCellCount(category.percent, cellCount) }, () => category.marker));
  const bodyCapacity = Math.max(0, cellCount - tailCells.length);
  const bodyCells = categories
    .filter((category) => category.label !== "Autocompact buffer")
    .flatMap((category) => Array.from({ length: getCellCount(category.percent, cellCount) }, () => category.marker))
    .slice(0, bodyCapacity);
  return [...bodyCells, ...tailCells].slice(0, cellCount);
}
