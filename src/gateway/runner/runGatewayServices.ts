import { runTelegramPollingLoop } from "../../adapters/telegram/runtime/runTelegramPollingLoop.js";

/**
 * Runs the long-lived adapter services owned by the gateway.
 *
 * @param isStopping Reports whether shutdown has started.
 * @returns A promise that resolves after all services stop.
 */
export async function runGatewayServices(isStopping: () => boolean): Promise<void> {
  await Promise.all([runTelegramPollingLoop(isStopping)]);
}
