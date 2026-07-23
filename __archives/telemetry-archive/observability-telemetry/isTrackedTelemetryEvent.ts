import { trackedTelemetryEvents } from "./trackedTelemetryEvents.js";

/**
 * Checks whether an event is present in the telemetry registry.
 *
 * @param eventId Telemetry event id.
 * @returns True when the event is tracked by Nexus.
 */
export function isTrackedTelemetryEvent(eventId: string): boolean {
  return trackedTelemetryEvents.some((event) => event.id === eventId);
}
