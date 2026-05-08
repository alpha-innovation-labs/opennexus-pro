import { resolve } from "node:path";
import { getPromptQueueDir } from "./getPromptQueueDir.js";

/**
 * Resolves the persisted prompt queue JSON file path for one session.
 *
 * @param sessionId Current session id.
 * @returns Absolute prompt queue file path.
 */
export function getPromptQueuePath(sessionId: string): string {
  const safeSessionId = sessionId.trim();
  if (!safeSessionId) throw new Error("prompt queue requires a session id");
  return resolve(getPromptQueueDir(), `${encodeURIComponent(safeSessionId)}.json`);
}
