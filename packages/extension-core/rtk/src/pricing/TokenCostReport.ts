import type { OpenRouterPricing } from "./OpenRouterPricing";

/**
 * Token cost estimate for the selected usage and savings report.
 */
export interface TokenCostReport {
  cachedCost: number;
  inputCost: number;
  outputCost: number;
  pricing: OpenRouterPricing;
  savedCost: number;
  totalCost: number;
}
