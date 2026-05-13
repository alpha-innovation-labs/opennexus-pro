import { formatModelCost } from "./formatModelCost.js";

/**
 * Formats input and output pricing columns for one model row.
 *
 * @param inputCost Input cost in US dollars per million tokens.
 * @param outputCost Output cost in US dollars per million tokens.
 * @returns Compact pricing columns.
 */
export function formatModelCatalogCostColumns(inputCost: number, outputCost: number): string {
  return `in ${formatModelCost(inputCost)}/M  out ${formatModelCost(outputCost)}/M`;
}
