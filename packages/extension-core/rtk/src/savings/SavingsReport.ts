import type { OpenRouterModelOption } from "../pricing/OpenRouterModelOption";
import type { OpenRouterPricing } from "../pricing/OpenRouterPricing";
import type { TokenUsageReport } from "../usage/TokenUsageReport";
import type { RtkGainReport } from "./RtkGainReport";

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
