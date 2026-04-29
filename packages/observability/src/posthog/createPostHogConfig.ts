import { DEFAULT_POSTHOG_HOST, POSTHOG_HOST_ENV, POSTHOG_PROJECT_API_KEY } from "./constants.js";
import type { PostHogConfig } from "./types.js";

/**
 * Creates PostHog configuration from environment variables.
 *
 * @param env Environment map to read.
 * @returns Resolved PostHog configuration.
 */
export function createPostHogConfig(env: NodeJS.ProcessEnv = process.env): PostHogConfig {
  return {
    apiKey: POSTHOG_PROJECT_API_KEY,
    host: env[POSTHOG_HOST_ENV] || DEFAULT_POSTHOG_HOST,
  };
}
