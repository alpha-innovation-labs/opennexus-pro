import { createAcceptHeader } from "./createAcceptHeader.js";
import { resolveTimeoutMs } from "./resolveTimeoutMs.js";
import type { WebFetchFormat } from "./webFetchTypes.js";

/**
 * Fetches a URL with browser-like headers, timeout, and Cloudflare challenge retry.
 *
 * @param url URL to fetch.
 * @param format Desired output format.
 * @param timeoutSeconds Optional timeout in seconds.
 * @param signal Optional cancellation signal.
 * @returns Successful fetch response.
 */
export async function fetchWithTimeout(
  url: string,
  format: WebFetchFormat,
  timeoutSeconds?: number,
  signal?: AbortSignal,
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(resolveTimeoutMs(timeoutSeconds));
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
    Accept: createAcceptHeader(format),
    "Accept-Language": "en-US,en;q=0.9",
  };
  const response = await fetch(url, { headers, signal: combinedSignal });
  if (response.status === 403 && response.headers.get("cf-mitigated") === "challenge") {
    return fetch(url, { headers: { ...headers, "User-Agent": "nexus" }, signal: combinedSignal });
  }
  return response;
}
