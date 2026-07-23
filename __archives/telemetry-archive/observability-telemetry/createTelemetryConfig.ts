import {
  DEFAULT_TELEMETRY_ENDPOINT,
  DEFAULT_TELEMETRY_SERVICE_NAME,
  TELEMETRY_ENDPOINT_ENV,
  TELEMETRY_VERSION_ENV,
} from "./constants.js";
import { readTelemetryFeatureEnabled } from "./readTelemetryFeatureEnabled.js";
import type { TelemetryConfig } from "./types.js";

/**
 * Creates telemetry configuration from environment variables.
 *
 * @param env Environment map to read.
 * @returns Resolved telemetry configuration.
 */
export function createTelemetryConfig(env: NodeJS.ProcessEnv = process.env): TelemetryConfig {
  return {
    enabled: readTelemetryFeatureEnabled(),
    endpoint: env[TELEMETRY_ENDPOINT_ENV] || DEFAULT_TELEMETRY_ENDPOINT,
    serviceName: DEFAULT_TELEMETRY_SERVICE_NAME,
    serviceVersion: env[TELEMETRY_VERSION_ENV] || "unknown",
  };
}
