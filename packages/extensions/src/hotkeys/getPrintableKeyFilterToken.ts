/**
 * Converts printable single-character input into a filter token.
 *
 * @param data Raw terminal input.
 * @returns Printable filter token, when available.
 */
export function getPrintableKeyFilterToken(data: string): string | undefined {
  if (data.length !== 1 || data < " " || data === "\u007f") return undefined;
  return data;
}
