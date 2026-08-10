/**
 * Probes a gateway to determine whether it is reachable, accessible,
 * or unreachable.
 *
 * Builds the `/v1/models` URL (or `/models` if baseUrl already ends
 * with `/v1`), sends a fetch request, and returns a detailed status.
 */
import type { GatewayProbeResult } from "./types";
import { DEFAULT_PORTS } from "../constants/default-ports";

/**
 * Returns the HTTP auth headers for this gateway.
 *
 * @param apiKey — Optional API key. Returns an empty object when absent.
 */
export function authHeaders(apiKey?: string): Record<string, string> {
  if (apiKey) {
    return { Authorization: `Bearer ${apiKey}` };
  }
  return {};
}

/**
 * Builds the `/v1/models` URL for a given base URL.
 *
 * If `baseUrl` already ends with `/v1`, appends `/models` directly.
 * Otherwise appends `/v1/models`.
 *
 * @param baseUrl — The base URL of the inference server.
 */
export function buildModelsUrl(baseUrl: string): string {
  return baseUrl.endsWith("/v1")
    ? `${baseUrl}/models`
    : `${baseUrl}/v1/models`;
}

/**
 * Probes the gateway at `/v1/models` (or `/models` if baseUrl already ends
 * with `/v1`) and returns a detailed status.
 *
 * Distinguishes three cases:
 * - `ok`: server responded with HTTP 200–299 and the body matches the
 *   OpenAI `/v1/models` contract (`{ data: [{ object: "model" }] })`)
 * - `access-denied`: server responded with a non-2xx status — the server
 *   IS an AI provider, but auth was rejected (401/403)
 * - `unreachable`: connection error (DNS failure, connection refused, timeout)
 *
 * @param baseUrl — The base URL of the inference server.
 * @param apiKey — Optional API key for authentication.
 * @param providerId — The provider identifier (used for port hints).
 */
export async function probeGateway(
  baseUrl: string,
  apiKey?: string,
  providerId?: string,
): Promise<GatewayProbeResult> {
  try {
    const url = buildModelsUrl(baseUrl);
    const res = await fetch(url, {
      headers: authHeaders(apiKey),
    });

    // Any HTTP response (2xx, 4xx, 5xx) means the server IS reachable
    // and exposes /v1/models — it is an AI provider.  Only connection
    // errors (caught below) mean "unreachable".
    if (!res.ok) {
      // 401 = auth key is wrong but this IS an AI provider.
      // All other non-2xx (403, 404, 500, etc.) = not an OpenAI-compatible AI provider.
      if (res.status === 401) {
        const port = DEFAULT_PORTS[providerId ?? ""];
        const portHint = port ? `port ${port}` : "a port";
        return {
          status: "access-denied",
          reason: `Access denied on ${portHint} — the server is running but rejected the request`,
        };
      }
      return {
        status: "not-a-gateway",
        reason: `Server responded with ${res.status} — not an OpenAI-compatible AI provider`,
      };
    }

    // Validate the response body matches the OpenAI /v1/models contract:
    // { data: [{ object: "model", id: string, ... }] }
    const body = await res.json();
    const dataArray = body?.data;
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return { status: "not-a-gateway", reason: "Not an OpenAI-compatible server (no data array)" };
    }
    const firstItem = dataArray[0];
    if (firstItem?.object !== "model") {
      return { status: "not-a-gateway", reason: "Not an OpenAI-compatible server (missing object: 'model')" };
    }
    return { status: "ok", statusCode: res.status, statusText: res.statusText };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { status: "unreachable", reason };
  }
}
