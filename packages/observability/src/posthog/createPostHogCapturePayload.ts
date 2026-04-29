import { sanitizePostHogProperties } from "./sanitizePostHogProperties.js";
import type { PostHogConfig, PostHogEvent } from "./types.js";

/**
 * Creates a PostHog capture API payload.
 *
 * @param config PostHog runtime configuration.
 * @param distinctId Anonymous distinct id.
 * @param event PostHog event input.
 * @returns Capture payload.
 */
export function createPostHogCapturePayload(
  config: PostHogConfig,
  distinctId: string,
  event: PostHogEvent,
): Record<string, unknown> {
  return {
    api_key: config.apiKey,
    event: event.event,
    properties: {
      ...sanitizePostHogProperties(event.properties),
      distinct_id: distinctId,
      $lib: "nexus-tui",
    },
  };
}
