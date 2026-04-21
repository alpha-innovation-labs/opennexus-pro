import { getGatewayStatus } from "../commands/getGatewayStatus.js";

/**
 * Waits for the gateway daemon to publish a running status.
 *
 * @param timeoutMs Maximum wait time.
 * @returns Latest gateway status.
 */
export async function waitForGatewayReady(timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() <= deadline) {
    const status = await getGatewayStatus();
    if (status.running && status.pid) {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Gateway did not become ready in time");
}
