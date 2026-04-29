import type { PostHogConfig } from "./types.js";

/**
 * Creates the PostHog capture endpoint URL.
 *
 * @param config PostHog runtime configuration.
 * @returns Capture API URL.
 */
export function createPostHogCaptureUrl(config: PostHogConfig): string {
  return `${config.host.replace(/\/+$/u, "")}/capture/`;
}
