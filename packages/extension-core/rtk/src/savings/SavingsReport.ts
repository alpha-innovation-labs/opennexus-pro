import type { OpenRouterPricing } from "../pricing/OpenRouterPricing.js";
import type { OpenRouterModelOption } from "../pricing/OpenRouterModelOption.js";
import type { TokenUsageReport } from "../usage/TokenUsageReport.js";
import type { RtkGainReport } from "./RtkGainReport.js";

/**
 * Combined savings report with RTK gains, session usage, and optional cost data.
 */
export interface SavingsReport {
  availableModels?: OpenRouterModelOption[];
  pricing?: OpenRouterPricing;
  pricingModelId?: string;
  rtk: RtkGainReport;
  usage?: TokenUsageReport;
}
