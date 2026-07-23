import { createOtlpAttributeValue } from "./createOtlpAttributeValue.js";
import type { TelemetryAttributeValue } from "./types.js";

/**
 * Converts sanitized attributes into OTLP JSON attribute entries.
 *
 * @param attributes Sanitized telemetry attributes.
 * @returns OTLP JSON attribute entries.
 */
export function createOtlpAttributes(attributes: Record<string, TelemetryAttributeValue>): Array<Record<string, unknown>> {
  return Object.entries(attributes).map(([key, value]) => ({
    key,
    value: createOtlpAttributeValue(value),
  }));
}
