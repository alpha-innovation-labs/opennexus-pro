import { sanitizeTelemetryAttributes } from "../telemetry/sanitizeTelemetryAttributes.js";
import type { TelemetryAttributes, TelemetryAttributeValue } from "../telemetry/types.js";

/**
 * Sanitizes PostHog properties using the telemetry allowlist sanitizer.
 *
 * @param properties Raw PostHog event properties.
 * @returns Sanitized PostHog properties.
 */
export function sanitizePostHogProperties(properties: TelemetryAttributes = {}): Record<string, TelemetryAttributeValue> {
  return sanitizeTelemetryAttributes(properties);
}
