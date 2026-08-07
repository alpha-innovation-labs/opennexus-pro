/**
 * Type definitions and static helpers for the AiGateway class.
 *
 * Exports the gateway probe result type, the cached provider state shape,
 * and utility functions for constructing base URLs from default ports.
 */
import { DEFAULT_PORTS } from "../constants/default-ports.js";

/** Result of probing a gateway. */
export type GatewayProbeResult =
  | { status: "ok"; statusCode: number; statusText: string }
  | { status: "access-denied"; reason: string }
  | { status: "unreachable"; reason: string };

/** Full cache: providerId → array of model objects. */
export type ProviderStateCache = Record<string, Array<Record<string, unknown>>>;

/** Options for constructing an AiGateway instance. */
export interface GatewayOptions {
  providerId: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  api?: string;
  apiPath?: string;
}

/**
 * Returns the default port for this provider, or undefined.
 */
export function defaultPort(providerId: string): number | undefined {
  return DEFAULT_PORTS[providerId];
}

/**
 * Returns a base URL constructed from a default port.
 *
 * @param providerId — The provider identifier.
 * @param port — Optional explicit port (falls back to default).
 * @throws Error if the provider has no default port.
 */
export function baseUrlFromPort(providerId: string, port?: number): string {
  const p = port ?? DEFAULT_PORTS[providerId];
  if (!p) {
    throw new Error(`Unknown provider "${providerId}" — no default port.`);
  }
  return `http://localhost:${p}`;
}
