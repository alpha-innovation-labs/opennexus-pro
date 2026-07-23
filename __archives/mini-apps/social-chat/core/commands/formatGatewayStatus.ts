import type { GatewayStatus } from "../state/types.js";

/**
 * Formats a single-line CLI summary for the gateway.
 *
 * @param status Gateway status to format.
 * @returns Human-readable status summary.
 */
export function formatGatewayStatus(status: GatewayStatus): string {
  if (!status.running) {
    return "social chat stopped";
  }

  return `social chat running (pid ${String(status.pid)})`;
}
