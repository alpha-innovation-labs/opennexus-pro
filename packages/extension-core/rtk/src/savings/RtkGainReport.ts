import type { RtkGainPeriod } from "./RtkGainPeriod.js";
import type { RtkGainSummary } from "./RtkGainSummary.js";

/**
 * RTK gain JSON report shape.
 */
export interface RtkGainReport {
  daily?: RtkGainPeriod[];
  monthly?: RtkGainPeriod[];
  summary: RtkGainSummary;
  weekly?: RtkGainPeriod[];
}
