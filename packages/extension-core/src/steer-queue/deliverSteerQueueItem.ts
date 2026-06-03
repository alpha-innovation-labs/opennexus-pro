import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { SteerQueueItem } from "./types.js";

/**
 * Delivers one steering queue item to the active Nexus session.
 *
 * @param pi Extension API used to inject user messages.
 * @param item Queue item to deliver.
 * @param agentIdle Whether the active agent is idle.
 */
export function deliverSteerQueueItem(pi: ExtensionAPI, item: SteerQueueItem, agentIdle: boolean): void {
  if (agentIdle) {
    pi.sendUserMessage(item.message);
    return;
  }
  pi.sendUserMessage(item.message, { deliverAs: "steer" });
}
