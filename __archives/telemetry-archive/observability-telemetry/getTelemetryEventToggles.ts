import { getTrackedTelemetryEvents } from "./getTrackedTelemetryEvents.js";
import { isTelemetryEventEnabled } from "./isTelemetryEventEnabled.js";

/**
 * Returns current enabled state for each tracked telemetry event.
 *
 * @returns Telemetry event definitions with enabled state.
 */
export function getTelemetryEventToggles(): Array<{ id: string; label: string; description: string; enabled: boolean }> {
  return getTrackedTelemetryEvents().map((event) => ({
    ...event,
    enabled: isTelemetryEventEnabled(event.id),
  }));
}
