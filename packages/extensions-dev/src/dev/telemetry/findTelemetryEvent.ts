import type { TelemetryEventDefinition } from "@nexus/observability/telemetry/TelemetryEventDefinition.js";

/**
 * Finds a telemetry event by id.
 *
 * @param events Available telemetry events.
 * @param eventId Event id to find.
 * @returns Matching event when present.
 */
export function findTelemetryEvent(events: TelemetryEventDefinition[], eventId: string): TelemetryEventDefinition | undefined {
  return events.find((event) => event.id === eventId);
}
