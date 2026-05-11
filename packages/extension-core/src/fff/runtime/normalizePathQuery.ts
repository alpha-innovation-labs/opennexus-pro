import { expandHomePath } from "./expandHomePath.js";
import { normalizeSlashes } from "./normalizeSlashes.js";
import { stripWrappedQuotes } from "./stripWrappedQuotes.js";

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
