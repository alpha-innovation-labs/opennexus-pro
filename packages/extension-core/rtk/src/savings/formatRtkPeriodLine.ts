import type { SharedModalTheme } from "@nexus/tui-kit/modal/index";
import type { RtkGainPeriod } from "./RtkGainPeriod";
import { colorizeSavingsPercent } from "./colorizeSavingsPercent";
import { colorizeSavingsValue } from "./colorizeSavingsValue";
import { formatPercent } from "./formatPercent";
import { formatTokenCount } from "./formatTokenCount";

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
