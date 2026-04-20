/**
 * Checks whether a value is a plain record-like object.
 *
 * @param value Unknown value.
 * @returns True when the value is a non-array object.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
