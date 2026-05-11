/**
 * Encodes a JSON cursor payload with a stable prefix.
 *
 * @param prefix Cursor namespace prefix.
 * @param payload JSON payload.
 * @returns Encoded cursor.
 */
export function encodeCursor(prefix: string, payload: unknown): string {
  return `${prefix}${Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")}`;
}
