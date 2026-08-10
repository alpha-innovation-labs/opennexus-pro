import { normalizeSearchText } from "./normalizeSearchText";

/**
 * Splits a search query into normalized tokens.
 *
 * @param query Raw search query.
 * @returns Non-empty normalized search tokens.
 */
export function createSearchTokens(query: string): string[] {
  const normalizedQuery = normalizeSearchText(query);
  return normalizedQuery ? normalizedQuery.split(/\s+/u) : [];
}
