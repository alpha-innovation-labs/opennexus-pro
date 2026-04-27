import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { RtkGainPeriod } from "./RtkGainPeriod.js";
import { colorizeSavingsPercent } from "./colorizeSavingsPercent.js";
import { colorizeSavingsValue } from "./colorizeSavingsValue.js";
import { formatPercent } from "./formatPercent.js";
import { formatTokenCount } from "./formatTokenCount.js";

/**
 * Formats one period row for the RTK savings modal.
 *
 * @param label Period label.
 * @param period Period row.
 * @param theme Active UI theme.
 * @returns Formatted modal line.
 */
export function formatRtkPeriodLine(label: string, period: RtkGainPeriod | undefined, theme: SharedModalTheme): string {
  if (!period) return `${label.padEnd(17)} ${theme.fg("dim", "No data")}`;
  return `${label.padEnd(17)} ${colorizeSavingsValue(theme, formatTokenCount(period.saved_tokens))} · ${colorizeSavingsPercent(theme, formatPercent(period.savings_pct))}`;
}
