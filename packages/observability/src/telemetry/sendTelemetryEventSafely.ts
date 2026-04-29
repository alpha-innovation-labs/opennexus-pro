import { sendPostHogEventSafely } from "../posthog/sendPostHogEventSafely.js";
import { sendTelemetryEvent } from "./sendTelemetryEvent.js";
import type { TelemetryAttributes } from "./types.js";

/**
 * Fire-and-forget wrapper that prevents telemetry failures from affecting Nexus.
 *
 * @param name Privacy-reviewed event name.
 * @param attributes Event attributes that must not contain user content.
 * @returns A promise that always resolves after telemetry handling completes.
 */
export async function sendTelemetryEventSafely(
  name: string,
  attributes: TelemetryAttributes = {},
): Promise<void> {
  setTimeout(() => {
    void sendTelemetryEventAsync(name, attributes);
  }, 0).unref?.();
}

/**
 * Sends telemetry asynchronously outside the caller's critical path.
 *
 * @param name Privacy-reviewed event name.
 * @param attributes Event attributes that must not contain user content.
 */
async function sendTelemetryEventAsync(name: string, attributes: TelemetryAttributes): Promise<void> {
  await Promise.all([
    sendSigNozTelemetryEventSafely(name, attributes),
    sendPostHogEventSafely(name, attributes),
  ]);
}

/**
 * Sends SigNoz telemetry without allowing failures to affect Nexus.
 *
 * @param name Privacy-reviewed event name.
 * @param attributes Event attributes that must not contain user content.
 */
async function sendSigNozTelemetryEventSafely(name: string, attributes: TelemetryAttributes): Promise<void> {
  try {
    await sendTelemetryEvent(name, attributes);
  } catch {
    // Telemetry must never affect Nexus runtime behavior.
  }
}
