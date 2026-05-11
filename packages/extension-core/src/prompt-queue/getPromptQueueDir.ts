import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { resolve } from "node:path";

/**
 * Resolves the Nexus prompt queue storage directory.
 *
 * @returns Absolute prompt queue directory path.
 */
export function getPromptQueueDir(): string {
  return resolve(getAgentDir(), "prompt-queue");
}
