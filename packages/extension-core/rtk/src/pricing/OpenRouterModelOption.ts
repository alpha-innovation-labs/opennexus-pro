import type { OpenRouterPricing } from "./OpenRouterPricing";

/**
 * OpenRouter model option with pricing attached.
 */
export interface OpenRouterModelOption {
  id: string;
  label: string;
  pricing: OpenRouterPricing;
}
