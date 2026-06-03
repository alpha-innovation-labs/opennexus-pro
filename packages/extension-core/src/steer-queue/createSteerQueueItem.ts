import type { SteerQueueItem } from "./types.js";

/**
 * Creates a persisted steering queue item.
 *
 * @param sessionId Target Nexus session id.
 * @param message Steering message text.
 * @param now Timestamp source.
 * @returns Queue item ready for persistence.
 */
export function createSteerQueueItem(sessionId: string, message: string, now = () => new Date()): SteerQueueItem {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    sessionId,
    message,
    createdAt: now().toISOString(),
    pid: process.pid,
  };
}
