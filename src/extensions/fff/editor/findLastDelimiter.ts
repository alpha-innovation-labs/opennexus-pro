const PATH_DELIMITERS = new Set([" ", "\t", '"', "'", "="]);

/**
 * Finds the last delimiter used by @-path token parsing.
 *
 * @param text Current text before the cursor.
 * @returns Delimiter index or -1.
 */
export function findLastDelimiter(text: string): number {
  for (let index = text.length - 1; index >= 0; index -= 1) {
    if (PATH_DELIMITERS.has(text[index] ?? "")) return index;
  }
  return -1;
}
