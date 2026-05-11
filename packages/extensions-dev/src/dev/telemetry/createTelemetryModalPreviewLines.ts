import { isTelemetryEventEnabled } from "@nexus/observability/telemetry/isTelemetryEventEnabled.js";
import type { TelemetryEventDefinition } from "@nexus/observability/telemetry/TelemetryEventDefinition.js";

/**
 * Creates right-pane details for a telemetry event.
 *
 * @param event Selected telemetry event.
 * @returns Preview lines.
 */
export function createTelemetryModalPreviewLines(event: TelemetryEventDefinition): string[] {
  return [
    `Event: ${event.id}`,
    `Status: ${isTelemetryEventEnabled(event.id) ? "enabled" : "disabled"}`,
    "",
    event.description,
    "",
    "Only anonymous, allowlisted metadata should be attached to telemetry events.",
  ];
}
