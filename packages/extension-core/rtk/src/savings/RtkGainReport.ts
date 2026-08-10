import type { RtkGainPeriod } from "./RtkGainPeriod";
import type { RtkGainSummary } from "./RtkGainSummary";

/**
 * RTK gain JSON report shape.
 */
export interface RtkGainReport {
  daily?: RtkGainPeriod[];
  monthly?: RtkGainPeriod[];
  summary: RtkGainSummary;
  weekly?: RtkGainPeriod[];
}
