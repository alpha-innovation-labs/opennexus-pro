import type { RtkGainReport } from "./RtkGainReport";
import { formatPercent } from "./formatPercent";
import { formatTokenCount } from "./formatTokenCount";

/**
 * Formats an RTK gain report as a compact Nexus savings summary.
 *
 * @param report Parsed RTK gain report.
 * @returns Human-readable savings summary.
 */
export function formatRtkSavings(report: RtkGainReport): string {
  const summary = report.summary;
  return [
    `Nexus saved ${formatTokenCount(summary.total_saved)} tokens (${formatPercent(summary.avg_savings_pct)})`,
    `${summary.total_commands.toLocaleString()} commands · ${formatTokenCount(summary.total_input)} in → ${formatTokenCount(summary.total_output)} out`,
  ].join("\n");
}
