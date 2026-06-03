import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { deliverSteerQueueItem } from "./deliverSteerQueueItem.js";
import { drainSteerQueueItems } from "./drainSteerQueueItems.js";

/**
 * Drains and delivers all queued steering messages for one session.
 *
 * @param pi Extension API used to inject user messages.
 * @param filePath Queue file path.
 * @param agentIdle Whether the active agent is idle.
 * @returns Number of delivered queue items.
 */
export async function pollSteerQueueOnce(pi: ExtensionAPI, filePath: string, agentIdle: boolean): Promise<number> {
  const items = await drainSteerQueueItems(filePath);
  for (const item of items) deliverSteerQueueItem(pi, item, agentIdle);
  return items.length;
}
