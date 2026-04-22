import type { ResolvedPath } from "../shared/types.js";

/**
 * Derives read offsets from an FFF path resolution location.
 *
 * @param resolution Resolved path details.
 * @param offset User-supplied offset.
 * @param limit User-supplied limit.
 * @returns Effective read offset and limit.
 */
export function locationToReadParams(
  resolution: ResolvedPath,
  offset: number | undefined,
  limit: number | undefined,
): { offset: number | undefined; limit: number | undefined } {
  if (offset !== undefined || !resolution.location) {
    return { offset, limit };
  }
  if (resolution.location.type === "line" || resolution.location.type === "position") {
    return { offset: resolution.location.line, limit: limit ?? 80 };
  }
  const rangeSize = Math.max(1, resolution.location.end.line - resolution.location.start.line + 1);
  return { offset: resolution.location.start.line, limit: limit ?? Math.max(rangeSize, 20) };
}
