import type { RtkGainPeriod } from "../savings/RtkGainPeriod";
import type { TokenUsagePeriod } from "../usage/TokenUsagePeriod";
import type { OpenRouterPricing } from "./OpenRouterPricing";
import type { TokenCostReport } from "./TokenCostReport";

/**
 * Creates a dollar cost estimate from usage, RTK savings, and pricing.
 *
 * @param usage Token usage period.
 * @param rtk RTK gain period.
 * @param pricing OpenRouter pricing.
 * @returns Cost estimate.
 */
export function createTokenCostReport(
  usage: TokenUsagePeriod,
  rtk: RtkGainPeriod,
  pricing: OpenRouterPricing,
): TokenCostReport {
  const inputCost = usage.input * pricing.input;
  const outputCost = usage.output * pricing.output;
  const cachedCost = usage.cacheRead * pricing.cachedInput;
  const savedCost = rtk.saved_tokens * pricing.input;
  return { cachedCost, inputCost, outputCost, pricing, savedCost, totalCost: inputCost + outputCost + cachedCost };
}
