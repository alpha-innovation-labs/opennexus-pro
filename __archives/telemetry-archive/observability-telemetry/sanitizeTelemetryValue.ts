import type { TelemetryAttributeValue } from "./types.js";

/**
 * Converts a telemetry value into an OTLP-safe primitive.
 *
 * @param value Raw telemetry attribute value.
 * @returns Sanitized telemetry value, or undefined when omitted.
 */
export function sanitizeTelemetryValue(
  value: TelemetryAttributeValue | null | undefined,
): TelemetryAttributeValue | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string") {
    return value.slice(0, 200);
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  return value;
}
