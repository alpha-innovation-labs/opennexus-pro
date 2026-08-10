import type { RtkGainReport } from "./RtkGainReport";
import type { SavingsReport } from "./SavingsReport";

/**
 * Unwraps a combined savings report to its RTK report.
 *
 * @param report RTK-only or combined savings report.
 * @returns RTK gain report.
 */
export function getSavingsReportRtk(report: RtkGainReport | SavingsReport): RtkGainReport {
  return "rtk" in report ? report.rtk : report;
}
