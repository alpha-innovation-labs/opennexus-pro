import type { TelemetryAttributes } from "../telemetry/types.js";
import { createPostHogPageViewUrl } from "./createPostHogPageViewUrl.js";
import { sendPostHogEvent } from "./sendPostHogEvent.js";

/**
 * Sends a synthetic PostHog page view for TUI command analytics.
 *
 * @param properties Command event properties.
 * @returns Promise that always resolves.
 */
export async function sendPostHogPageViewSafely(properties: TelemetryAttributes): Promise<void> {
  try {
    await sendPostHogEvent("$pageview", {
      ...properties,
      "$current_url": createPostHogPageViewUrl(properties),
      "$host": "nexus.tui",
      "$pathname": createPostHogPageViewUrl(properties).replace("nexus://commands", "/commands"),
    });
  } catch {
    // Product analytics must never affect Nexus runtime behavior.
  }
}
