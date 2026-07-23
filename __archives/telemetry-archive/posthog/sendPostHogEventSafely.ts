import type { TelemetryAttributes } from "../telemetry/types.js";
import { sendPostHogEvent } from "./sendPostHogEvent.js";
import { sendPostHogPageViewSafely } from "./sendPostHogPageViewSafely.js";
import { shouldSendPostHogPageView } from "./shouldSendPostHogPageView.js";

/**
 * Sends PostHog telemetry without allowing analytics failures to affect Nexus.
 *
 * @param name Event name.
 * @param properties Event properties.
 * @returns Promise that always resolves.
 */
export async function sendPostHogEventSafely(name: string, properties: TelemetryAttributes = {}): Promise<void> {
  await Promise.all([
    sendPostHogCaptureSafely(name, properties),
    shouldSendPostHogPageView(name) ? sendPostHogPageViewSafely(properties) : Promise.resolve(),
  ]);
}

/**
 * Sends the primary PostHog capture event safely.
 *
 * @param name Event name.
 * @param properties Event properties.
 */
async function sendPostHogCaptureSafely(name: string, properties: TelemetryAttributes): Promise<void> {
  try {
    await sendPostHogEvent(name, properties);
  } catch {
    // Product analytics must never affect Nexus runtime behavior.
  }
}
