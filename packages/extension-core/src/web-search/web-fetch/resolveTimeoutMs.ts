import { DEFAULT_TIMEOUT_SECONDS, MAX_TIMEOUT_SECONDS } from "./constants.js";

/**
 * Resolves user timeout seconds to a bounded millisecond timeout.
 *
 * @param timeoutSeconds Optional timeout in seconds.
 * @returns Timeout duration in milliseconds.
 */
export function resolveTimeoutMs(timeoutSeconds?: number): number {
  const seconds = Number.isFinite(timeoutSeconds) && timeoutSeconds ? timeoutSeconds : DEFAULT_TIMEOUT_SECONDS;
  return Math.min(Math.max(seconds, 1), MAX_TIMEOUT_SECONDS) * 1000;
}
