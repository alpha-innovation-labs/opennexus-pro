/**
 * Normalizes an inserted autocomplete value for FFF tracking.
 *
 * @param value Inserted autocomplete value.
 * @returns Path-only value.
 */
export function normalizeInsertedPath(value: string): string {
  let normalized = value.trim();
  if (normalized.startsWith("@")) normalized = normalized.slice(1);
  if (normalized.startsWith('"') && normalized.endsWith('"') && normalized.length >= 2) {
    normalized = normalized.slice(1, -1);
  }
  return normalized;
}
