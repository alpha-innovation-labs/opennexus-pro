import { createPostHogCapturePayload } from "./createPostHogCapturePayload.js";
import { createPostHogCaptureUrl } from "./createPostHogCaptureUrl.js";
import { createPostHogConfig } from "./createPostHogConfig.js";
import { ensurePostHogDistinctId } from "./ensurePostHogDistinctId.js";
import type { PostHogConfig, PostHogFetch } from "./types.js";
import type { TelemetryAttributes } from "../telemetry/types.js";

/**
 * Sends one sanitized event to PostHog.
 *
 * @param name Event name.
 * @param properties Event properties.
 * @param config Optional PostHog configuration.
 * @param transport Optional fetch implementation.
 * @param distinctId Optional anonymous distinct id override.
 * @returns True when PostHog accepted the request.
 */
export async function sendPostHogEvent(
  name: string,
  properties: TelemetryAttributes = {},
  config: PostHogConfig = createPostHogConfig(),
  transport: PostHogFetch = fetch,
  distinctId?: string,
): Promise<boolean> {
  const resolvedDistinctId = distinctId ?? await ensurePostHogDistinctId();
  const response = await transport(createPostHogCaptureUrl(config), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(createPostHogCapturePayload(config, resolvedDistinctId, { event: name, properties })),
  });
  return response.ok;
}
