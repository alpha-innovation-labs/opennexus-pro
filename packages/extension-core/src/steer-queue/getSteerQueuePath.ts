import { resolve } from "node:path";
import { getSteerQueueDir } from "./getSteerQueueDir.js";

/**
 * Resolves the steering queue JSONL path for one session.
 *
 * @param sessionId Target Nexus session id.
 * @returns Absolute queue file path.
 */
export function getSteerQueuePath(sessionId: string): string {
  const safeSessionId = sessionId.trim();
  if (!safeSessionId) throw new Error("steer queue requires a session id");
  return resolve(getSteerQueueDir(), `${encodeURIComponent(safeSessionId)}.jsonl`);
}
