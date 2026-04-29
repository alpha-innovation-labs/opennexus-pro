import { disabledTelemetryEvents } from "./disabledTelemetryEvents.js";
import { isTrackedTelemetryEvent } from "./isTrackedTelemetryEvent.js";

/**
 * Checks whether a telemetry event is enabled for the current process.
 *
 * @param eventId Telemetry event id.
 * @returns True when the event is not disabled.
 */
export function isTelemetryEventEnabled(eventId: string): boolean {
  return !isTrackedTelemetryEvent(eventId) || !disabledTelemetryEvents.has(eventId);
}
