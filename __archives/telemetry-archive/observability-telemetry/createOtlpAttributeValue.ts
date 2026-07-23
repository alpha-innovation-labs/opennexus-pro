import type { TelemetryAttributeValue } from "./types.js";

/**
 * Converts a primitive telemetry value into OTLP JSON value shape.
 *
 * @param value Sanitized telemetry attribute value.
 * @returns OTLP JSON attribute value.
 */
export function createOtlpAttributeValue(value: TelemetryAttributeValue): Record<string, unknown> {
  if (typeof value === "string") {
    return { stringValue: value };
  }
  if (typeof value === "boolean") {
    return { boolValue: value };
  }
  return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value };
}
