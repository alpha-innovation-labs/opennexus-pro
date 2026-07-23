import { createTelemetryConfig } from "./createTelemetryConfig.js";
import { createTelemetryPayload } from "./createTelemetryPayload.js";
import { isTelemetryEventEnabled } from "./isTelemetryEventEnabled.js";
import type { TelemetryAttributes, TelemetryConfig, TelemetryFetch } from "./types.js";

/**
 * Sends a single anonymous Nexus telemetry event when telemetry is enabled.
 *
 * @param name Privacy-reviewed event name.
 * @param attributes Event attributes that must not contain user content.
 * @param config Optional telemetry configuration override.
 * @param transport Optional fetch implementation for tests.
 * @returns True when a request was attempted and accepted by the endpoint.
 */
export async function sendTelemetryEvent(
  name: string,
  attributes: TelemetryAttributes = {},
  config: TelemetryConfig = createTelemetryConfig(),
  transport: TelemetryFetch = fetch,
): Promise<boolean> {
  if (!config.enabled || !isTelemetryEventEnabled(name)) {
    return false;
  }
  const response = await transport(config.endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(createTelemetryPayload(config, name, attributes)),
  });
  return response.ok;
}
