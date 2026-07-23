/**
 * Optional environment override for the OTLP HTTP endpoint.
 */
export const TELEMETRY_ENDPOINT_ENV = "NEXUS_TELEMETRY_ENDPOINT";

/**
 * Optional environment override for the telemetry service version.
 */
export const TELEMETRY_VERSION_ENV = "NEXUS_TELEMETRY_VERSION";

/**
 * Public OTLP HTTP endpoint routed through Caddy to local SigNoz.
 */
export const DEFAULT_TELEMETRY_ENDPOINT = "https://rybbit.alphainnovationlabs.com/otel/v2/traces";

/**
 * Service name used by Nexus process telemetry.
 */
export const DEFAULT_TELEMETRY_SERVICE_NAME = "nexus";
