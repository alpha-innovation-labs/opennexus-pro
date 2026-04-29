import { disabledTelemetryEvents } from "./disabledTelemetryEvents.js";

/**
 * Enables or disables a telemetry event for the current process.
 *
 * @param eventId Telemetry event id.
 * @param enabled Whether the event should be emitted.
 */
export function setTelemetryEventEnabled(eventId: string, enabled: boolean): void {
  if (enabled) {
    disabledTelemetryEvents.delete(eventId);
    return;
  }
  disabledTelemetryEvents.add(eventId);
}
