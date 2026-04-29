import { sanitizeTelemetryKey } from "./sanitizeTelemetryKey.js";
import { sanitizeTelemetryValue } from "./sanitizeTelemetryValue.js";
import type { TelemetryAttributes, TelemetryAttributeValue } from "./types.js";

/**
 * Sanitizes a telemetry attribute map before serialization.
 *
 * @param attributes Raw telemetry attributes.
 * @returns Sanitized attributes with empty keys and nullish values removed.
 */
export function sanitizeTelemetryAttributes(
  attributes: TelemetryAttributes = {},
): Record<string, TelemetryAttributeValue> {
  const sanitized: Record<string, TelemetryAttributeValue> = {};
  for (const [rawKey, rawValue] of Object.entries(attributes)) {
    const key = sanitizeTelemetryKey(rawKey);
    const value = sanitizeTelemetryValue(rawValue);
    if (key && value !== undefined) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
