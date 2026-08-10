import { normalizeSlashes } from "./normalizeSlashes";

/**
 * Normalizes a glob constraint for FFF.
 *
 * @param glob Optional glob string.
 * @returns Native constraint fragment.
 */
export function nativeConstraintForGlob(glob: string | undefined): string | undefined {
  if (!glob) return undefined;
  const normalized = normalizeSlashes(glob.trim());
  return normalized || undefined;
}
