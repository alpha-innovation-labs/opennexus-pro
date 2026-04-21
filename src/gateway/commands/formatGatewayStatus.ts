import type { GatewayStatus } from "../state/types.js";

/**
 * Formats a single-line CLI summary for the gateway.
 *
 * @param status Gateway status to format.
 * @returns Human-readable status summary.
 */
export function formatGatewayStatus(status: GatewayStatus): string {
  if (!status.running) {
    return "adapter gateway stopped";
  }

  return `adapter gateway running (pid ${String(status.pid)})`;
}
