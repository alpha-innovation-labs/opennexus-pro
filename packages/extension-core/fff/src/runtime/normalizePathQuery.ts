import { expandHomePath } from "./expandHomePath";
import { normalizeSlashes } from "./normalizeSlashes";
import { stripWrappedQuotes } from "./stripWrappedQuotes";

/**
 * Normalizes fuzzy file path input for FFF lookup.
 *
 * @param value Raw user query.
 * @returns Normalized query.
 */
export function normalizePathQuery(value: string): string {
  let normalized = value.trim();
  if (normalized.startsWith("@")) normalized = normalized.slice(1);
  return normalizeSlashes(expandHomePath(stripWrappedQuotes(normalized.trim())));
}
