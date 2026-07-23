import { isTelemetryEventEnabled } from "./isTelemetryEventEnabled.js";
import { setTelemetryEventEnabled } from "./setTelemetryEventEnabled.js";

/**
 * Toggles a telemetry event for the current process.
 *
 * @param eventId Telemetry event id.
 * @returns The new enabled state.
 */
export function toggleTelemetryEvent(eventId: string): boolean {
  const enabled = !isTelemetryEventEnabled(eventId);
  setTelemetryEventEnabled(eventId, enabled);
  return enabled;
}
