import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { pollSteerQueueOnce } from "./pollSteerQueueOnce.js";

export interface SteerQueuePollingHandle {
  stop(): void;
}

/**
 * Starts periodic polling for a session steering queue.
 *
 * @param pi Extension API used to inject user messages.
 * @param filePath Queue file path.
 * @param isAgentIdle Reads the current agent busy state.
 * @param pollIntervalMs Poll interval in milliseconds.
 * @returns Handle that stops polling.
 */
export function startSteerQueuePolling(pi: ExtensionAPI, filePath: string, isAgentIdle: () => boolean, pollIntervalMs: number): SteerQueuePollingHandle {
  let stopped = false;
  let inFlight = false;

  const poll = () => {
    if (stopped || inFlight) return;
    inFlight = true;
    void pollSteerQueueOnce(pi, filePath, isAgentIdle()).finally(() => {
      inFlight = false;
    });
  };

  const timer = setInterval(poll, pollIntervalMs);
  poll();

  return {
    stop() {
      stopped = true;
      clearInterval(timer);
    },
  };
}
