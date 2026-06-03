import { appendFile } from "node:fs/promises";
import { createSteerQueueItem } from "./createSteerQueueItem.js";
import { getSteerQueuePath } from "./getSteerQueuePath.js";
import { sanitizeSteerQueueMessage } from "./sanitizeSteerQueueMessage.js";
import { serializeSteerQueueItem } from "./serializeSteerQueueItem.js";
import type { SteerQueueItem } from "./types.js";
import { withSteerQueueFileLock } from "./withSteerQueueFileLock.js";

/**
 * Appends one steering message to a target session queue.
 *
 * @param sessionId Target Nexus session id.
 * @param message Steering message text.
 * @returns Persisted queue item.
 */
export async function appendSteerQueueItem(sessionId: string, message: string): Promise<SteerQueueItem> {
  const targetSessionId = sessionId.trim();
  if (!targetSessionId) throw new Error("Usage: nexus steer <session-id> <message>");
  const sanitizedMessage = sanitizeSteerQueueMessage(message);
  if (!sanitizedMessage) throw new Error("Usage: nexus steer <session-id> <message>");

  const item = createSteerQueueItem(targetSessionId, sanitizedMessage);
  const filePath = getSteerQueuePath(targetSessionId);
  await withSteerQueueFileLock(filePath, async () => {
    await appendFile(filePath, serializeSteerQueueItem(item), "utf8");
  });
  return item;
}
