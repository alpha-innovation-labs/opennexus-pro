/**
 * Converts an attribute key into a conservative telemetry-safe key.
 *
 * @param key Raw attribute key.
 * @returns Sanitized key, or undefined when the key is unusable.
 */
export function sanitizeTelemetryKey(key: string): string | undefined {
  const sanitized = key.trim().replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 80);
  return sanitized.length > 0 ? sanitized : undefined;
}
