/**
 * Normalizes path separators to forward slashes.
 *
 * @param value Raw path string.
 * @returns Slash-normalized path.
 */
export function normalizeSlashes(value: string): string {
  return value.replace(/\\/g, "/");
}
