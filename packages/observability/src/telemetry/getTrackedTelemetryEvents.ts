import { trackedTelemetryEvents } from "./trackedTelemetryEvents.js";
import type { TelemetryEventDefinition } from "./TelemetryEventDefinition.js";

/**
 * Returns the telemetry event registry for dev tooling.
 *
 * @returns Registered telemetry event definitions.
 */
export function getTrackedTelemetryEvents(): TelemetryEventDefinition[] {
  return [...trackedTelemetryEvents];
}
