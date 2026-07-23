import type { TelemetryAttributes } from "../telemetry/types.js";

/**
 * Runtime configuration for PostHog capture.
 */
export type PostHogConfig = {
  apiKey: string;
  host: string;
};

/**
 * PostHog capture event input.
 */
export type PostHogEvent = {
  event: string;
  properties?: TelemetryAttributes;
};

/**
 * Fetch-like transport used by PostHog tests.
 */
export type PostHogFetch = (input: string, init: RequestInit) => Promise<Response>;
