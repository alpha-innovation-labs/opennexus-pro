import type { SharedModalTheme } from "@nexus/tui-kit/modal/index";

const EFFICIENCY_BAR_WIDTH = 24;

/**
 * Creates a colored RTK savings efficiency meter.
 *
 * @param theme Active UI theme.
 * @param percent Savings percentage.
 * @returns Rendered efficiency meter.
 */
export function createEfficiencyMeter(theme: SharedModalTheme, percent: number): string {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const filledCells = Math.round((clampedPercent / 100) * EFFICIENCY_BAR_WIDTH);
  const filled = theme.fg("success", "█".repeat(filledCells));
  const empty = theme.fg("dim", "░".repeat(EFFICIENCY_BAR_WIDTH - filledCells));
  return `[${filled}${empty}]`;
}
