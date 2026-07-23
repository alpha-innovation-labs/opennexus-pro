/**
 * Scalar values allowed in privacy-reviewed Nexus telemetry attributes.
 */
export type TelemetryAttributeValue = string | number | boolean;

/**
 * Attribute map accepted by the Nexus telemetry sender.
 */
export type TelemetryAttributes = Record<string, TelemetryAttributeValue | null | undefined>;

/**
 * Runtime configuration for anonymous Nexus telemetry.
 */
export type TelemetryConfig = {
  enabled: boolean;
  endpoint: string;
  serviceName: string;
  serviceVersion: string;
};

/**
 * Fetch-like transport used to keep telemetry tests deterministic.
 */
export type TelemetryFetch = (input: string, init: RequestInit) => Promise<Response>;
